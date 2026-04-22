import { NextResponse } from "next/server";

import { getMissingStripeCheckoutEnv, env } from "@/lib/env";
import { applyPromoPercent, findPromoRule } from "@/lib/promo";
import { getStripeServerClient } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validations/catalog";

const isDev = process.env.NODE_ENV !== "production";

function logCheckout(event: string, details?: Record<string, unknown>) {
  // Never log the raw Stripe secret or full user email in prod logs.
  // In dev we include the details map so QA can see exactly what failed.
  if (isDev) {
    console.info(`[checkout] ${event}`, details ?? {});
    return;
  }
  console.info(`[checkout] ${event}`);
}

function logCheckoutError(event: string, error: unknown) {
  const payload = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  };

  console.error(`[checkout] ${event}`, payload);
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    logCheckout("supabase-client-missing");
    return NextResponse.json(
      {
        message: "Brak konfiguracji Supabase.",
        code: "supabase_missing",
      },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logCheckout("user-unauthenticated");
    return NextResponse.json(
      {
        message: "Zaloguj się, aby przejść do płatności.",
        code: "unauthenticated",
      },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => null);

  if (!payload) {
    logCheckout("invalid-json", { userId: user.id });
    return NextResponse.json(
      { message: "Nieprawidłowe dane wejściowe.", code: "bad_payload" },
      { status: 400 },
    );
  }

  const parsed = checkoutSchema.safeParse(payload);

  if (!parsed.success) {
    logCheckout("schema-invalid", {
      userId: user.id,
      issues: parsed.error.issues.map((issue) => issue.message),
    });
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Niepoprawne dane checkoutu.",
        code: "validation_error",
      },
      { status: 400 },
    );
  }

  const missingEnv = getMissingStripeCheckoutEnv();

  if (missingEnv.length > 0) {
    logCheckoutError(
      "stripe-env-missing",
      new Error(`Brakuje konfiguracji: ${missingEnv.join(", ")}`),
    );
    return NextResponse.json(
      {
        message: isDev
          ? `Brakuje konfiguracji Stripe: ${missingEnv.join(", ")}. Uzupełnij .env.local i zrestartuj serwer.`
          : "Płatności są chwilowo niedostępne. Spróbuj ponownie za chwilę.",
        code: "stripe_env_missing",
        missing: isDev ? missingEnv : undefined,
      },
      { status: 503 },
    );
  }

  const stripe = getStripeServerClient();

  if (!stripe) {
    logCheckoutError("stripe-client-init-failed", new Error("getStripeServerClient returned null"));
    return NextResponse.json(
      {
        message: "Nie udało się zainicjalizować klienta Stripe.",
        code: "stripe_init_failed",
      },
      { status: 500 },
    );
  }

  const aggregatedItems = Array.from(
    parsed.data.items.reduce((map, item) => {
      const currentQuantity = map.get(item.productId) ?? 0;
      map.set(item.productId, currentQuantity + item.quantity);
      return map;
    }, new Map<string, number>()),
  );

  const productIds = aggregatedItems.map(([productId]) => productId);

  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, name, short_description, price, is_active, status")
    .in("id", productIds)
    .eq("is_active", true);

  if (error || !products) {
    logCheckoutError("products-fetch-failed", error ?? new Error("empty products result"));
    return NextResponse.json(
      {
        message: "Nie udało się pobrać produktów do checkoutu.",
        code: "products_fetch_failed",
      },
      { status: 500 },
    );
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const missingProducts = productIds.filter((productId) => !productMap.has(productId));
  const unpublishedProducts = products.filter((product) => product.status !== "published");

  if (missingProducts.length > 0 || unpublishedProducts.length > 0) {
    logCheckout("products-unavailable", {
      missingProducts,
      unpublishedProducts: unpublishedProducts.map((product) => product.id),
    });
    return NextResponse.json(
      {
        message:
          "Część produktów nie jest już dostępna. Odśwież koszyk i spróbuj ponownie.",
        code: "products_unavailable",
      },
      { status: 400 },
    );
  }

  const promoRule = findPromoRule(parsed.data.promoCode);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${env.siteUrl}/checkout/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.siteUrl}/checkout/anulowano`,
      customer_email: user.email ?? parsed.data.email,
      client_reference_id: user.id,
      locale: "pl",
      metadata: {
        user_id: user.id,
        user_email: user.email ?? parsed.data.email,
        promo_code: promoRule?.code ?? "",
      },
      line_items: aggregatedItems.map(([productId, quantity]) => {
        const product = productMap.get(productId);

        if (!product) {
          throw new Error(`Brak produktu ${productId} w mapie checkoutu.`);
        }

        const baseUnitAmount = product.price * 100;
        const unitAmount = promoRule
          ? applyPromoPercent(baseUnitAmount, promoRule.percentOff)
          : baseUnitAmount;

        return {
          quantity,
          price_data: {
            currency: "pln",
            unit_amount: unitAmount,
            product_data: {
              name: promoRule ? `${product.name} (${promoRule.label})` : product.name,
              description: product.short_description,
              metadata: {
                product_id: product.id,
                product_slug: product.slug,
              },
            },
          },
        };
      }),
    });

    if (!session.url) {
      logCheckoutError("session-url-missing", new Error("Stripe returned no URL"));
      return NextResponse.json(
        {
          message: "Stripe nie zwrócił adresu Checkout Session.",
          code: "session_url_missing",
        },
        { status: 500 },
      );
    }

    logCheckout("session-created", {
      userId: user.id,
      sessionId: session.id,
      items: aggregatedItems.length,
      promoCode: promoRule?.code ?? null,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    logCheckoutError("session-create-failed", error);
    return NextResponse.json(
      {
        message: isDev
          ? `Stripe odrzucił utworzenie sesji: ${
              error instanceof Error ? error.message : String(error)
            }`
          : "Nie udało się utworzyć sesji płatności. Spróbuj ponownie za chwilę.",
        code: "session_create_failed",
      },
      { status: 502 },
    );
  }
}

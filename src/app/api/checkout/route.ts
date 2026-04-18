import { NextResponse } from "next/server";

import { getMissingStripeCheckoutEnv, env } from "@/lib/env";
import { applyPromoPercent, findPromoRule } from "@/lib/promo";
import { getStripeServerClient } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validations/catalog";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Brak konfiguracji Supabase." },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Zaloguj się, aby przejść do płatności." },
      { status: 401 },
    );
  }

  const payload = await request.json();
  const parsed = checkoutSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Niepoprawne dane checkoutu.",
      },
      { status: 400 },
    );
  }

  const missingEnv = getMissingStripeCheckoutEnv();

  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        message: `Brakuje konfiguracji Stripe: ${missingEnv.join(", ")}.`,
      },
      { status: 500 },
    );
  }

  const stripe = getStripeServerClient();

  if (!stripe) {
    return NextResponse.json(
      { message: "Nie udało się zainicjalizować klienta Stripe." },
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
    return NextResponse.json(
      { message: "Nie udało się pobrać produktów do checkoutu." },
      { status: 500 },
    );
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const missingProducts = productIds.filter((productId) => !productMap.has(productId));
  const unpublishedProducts = products.filter((product) => product.status !== "published");

  if (missingProducts.length > 0 || unpublishedProducts.length > 0) {
    return NextResponse.json(
      {
        message:
          "Część produktów nie jest już dostępna. Odśwież koszyk i spróbuj ponownie.",
      },
      { status: 400 },
    );
  }

  const promoRule = findPromoRule(parsed.data.promoCode);

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
    return NextResponse.json(
      { message: "Stripe nie zwrócił adresu Checkout Session." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    url: session.url,
  });
}

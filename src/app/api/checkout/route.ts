import { NextResponse } from "next/server";

import { resolveCouponCode } from "@/lib/coupons";
import { getMissingStripeCheckoutEnv, env } from "@/lib/env";
import { lookupGiftCode } from "@/lib/gift-codes";
import { applyPromoPercent } from "@/lib/promo";
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

function trimMetadata(value: string | null | undefined, max = 300) {
  return value?.trim().slice(0, max) ?? "";
}

function parsePercent(value: string | null | undefined, fallback = 20) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), 80);
}

async function getOrderBumpConfig(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
) {
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [
      "order_bump_enabled",
      "order_bump_product_id",
      "order_bump_percent_off",
    ]);

  const settings = new Map((data ?? []).map((entry) => [entry.key, entry.value]));

  return {
    enabled: settings.get("order_bump_enabled") !== "false",
    productId: trimMetadata(settings.get("order_bump_product_id"), 80),
    percentOff: parsePercent(settings.get("order_bump_percent_off"), 20),
  };
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
  const orderBumpConfig = await getOrderBumpConfig(supabase);
  const requestedOrderBumpProductId = parsed.data.orderBumpProductId?.trim() || null;
  const orderBumpAlreadyInCart =
    requestedOrderBumpProductId && productIds.includes(requestedOrderBumpProductId);

  if (
    requestedOrderBumpProductId &&
    (!orderBumpConfig.enabled ||
      orderBumpAlreadyInCart ||
      (orderBumpConfig.productId &&
        orderBumpConfig.productId !== requestedOrderBumpProductId))
  ) {
    logCheckout("order-bump-unavailable", {
      userId: user.id,
      requestedOrderBumpProductId,
      configuredProductId: orderBumpConfig.productId || null,
      orderBumpAlreadyInCart,
    });
    return NextResponse.json(
      {
        message:
          "Oferta dodatkowa jest już nieaktualna. Odśwież checkout i spróbuj ponownie.",
        code: "order_bump_unavailable",
      },
      { status: 400 },
    );
  }

  const orderBumpProductId = requestedOrderBumpProductId;
  const checkoutProductIds = Array.from(
    new Set([...productIds, ...(orderBumpProductId ? [orderBumpProductId] : [])]),
  );

  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, name, short_description, price, is_active, status")
    .in("id", checkoutProductIds)
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
  const missingProducts = checkoutProductIds.filter((productId) => !productMap.has(productId));
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

  const promoRule = await resolveCouponCode(parsed.data.promoCode);

  if (parsed.data.promoCode?.trim() && !promoRule) {
    return NextResponse.json(
      {
        message: "Kod rabatowy jest nieaktywny albo wygasł.",
        code: "coupon_invalid",
      },
      { status: 400 },
    );
  }

  const orderBumpProduct = orderBumpProductId
    ? productMap.get(orderBumpProductId)
    : null;
  const orderBumpBaseUnitMinor = orderBumpProduct
    ? orderBumpProduct.price * 100
    : 0;
  const orderBumpDiscountMinor = orderBumpProduct
    ? Math.max(
        orderBumpBaseUnitMinor -
          applyPromoPercent(orderBumpBaseUnitMinor, orderBumpConfig.percentOff),
        0,
      )
    : 0;
  const orderBumpUnitBeforeCoupon = Math.max(
    orderBumpBaseUnitMinor - orderBumpDiscountMinor,
    0,
  );

  const checkoutLines = [
    ...aggregatedItems.map(([productId, quantity]) => {
      const product = productMap.get(productId);

      if (!product) {
        throw new Error(`Brak produktu ${productId} w mapie checkoutu.`);
      }

      const unitBeforeCoupon = product.price * 100;
      const unitAmount = promoRule
        ? applyPromoPercent(unitBeforeCoupon, promoRule.percentOff)
        : unitBeforeCoupon;

      return {
        product,
        quantity,
        unitBeforeCoupon,
        unitAmount,
        kind: "regular" as const,
      };
    }),
    ...(orderBumpProduct
      ? [
          {
            product: orderBumpProduct,
            quantity: 1,
            unitBeforeCoupon: orderBumpUnitBeforeCoupon,
            unitAmount: promoRule
              ? applyPromoPercent(orderBumpUnitBeforeCoupon, promoRule.percentOff)
              : orderBumpUnitBeforeCoupon,
            kind: "order_bump" as const,
          },
        ]
      : []),
  ];

  const subtotalBeforeCouponMinor = checkoutLines.reduce(
    (sum, line) => sum + line.unitBeforeCoupon * line.quantity,
    0,
  );
  const subtotalAfterCouponMinor = checkoutLines.reduce(
    (sum, line) => sum + line.unitAmount * line.quantity,
    0,
  );
  const couponDiscountMinor = Math.max(
    subtotalBeforeCouponMinor - subtotalAfterCouponMinor,
    0,
  );

  // Resolve the gift voucher (if any). Vouchers are stacked AFTER the
  // percentage promo: we shave dollars off the discounted total. If the
  // lookup fails we hard-stop so the buyer doesn't think their voucher
  // worked when it didn't.
  let giftCodeRow: { id: string; code: string; amountMinor: number } | null =
    null;
  const rawGiftCode = parsed.data.giftCode?.trim();
  if (rawGiftCode) {
    const lookup = await lookupGiftCode(rawGiftCode);
    if (lookup.status !== "ok") {
      return NextResponse.json(
        { message: lookup.message, code: "gift_code_invalid" },
        { status: 400 },
      );
    }
    giftCodeRow = {
      id: lookup.id,
      code: lookup.code,
      amountMinor: lookup.amountMinor,
    };
  }

  // Validate the affiliate code against the live `affiliates` table.
  // Anything unknown / inactive is silently dropped — we never want to
  // award commission for a fake code, but we also don't want a typo to
  // block the buyer from completing checkout.
  let affiliateCode: string | null = null;
  if (parsed.data.affiliateRef) {
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("code, is_active")
      .eq("code", parsed.data.affiliateRef)
      .maybeSingle();
    if (affiliate?.is_active) {
      affiliateCode = affiliate.code;
    }
  }
  const attribution = parsed.data.attribution;

  // Compute the discount amount the gift code grants. Capped at the
  // post-promo subtotal because Stripe rejects coupons larger than the
  // order. We create a single-use Stripe coupon below — never reuse it.
  let giftCoupon: { couponId: string; appliedMinor: number } | null = null;
  if (giftCodeRow) {
    const appliedMinor = Math.min(giftCodeRow.amountMinor, subtotalAfterCouponMinor);
    if (appliedMinor > 0) {
      try {
        const coupon = await stripe.coupons.create({
          amount_off: appliedMinor,
          currency: "pln",
          duration: "once",
          name: `Voucher ${giftCodeRow.code}`,
          metadata: { gift_code_id: giftCodeRow.id, gift_code: giftCodeRow.code },
        });
        giftCoupon = { couponId: coupon.id, appliedMinor };
      } catch (error) {
        logCheckoutError("gift-coupon-create-failed", error);
        return NextResponse.json(
          {
            message: "Nie udało się zastosować vouchera. Spróbuj ponownie.",
            code: "gift_coupon_failed",
          },
          { status: 502 },
        );
      }
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(giftCoupon
        ? { discounts: [{ coupon: giftCoupon.couponId }] }
        : {}),
      // BLIK + Przelewy24 require capability activation in the Stripe
      // dashboard. Once enabled there, switch this to ["card", "p24",
      // "blik"] to expose them at checkout. Until then card-only avoids
      // a Stripe "must enable in dashboard" error.
      payment_method_types: ["card"],
      success_url: `${env.siteUrl}/checkout/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.siteUrl}/checkout/anulowano`,
      customer_email: user.email ?? parsed.data.email,
      client_reference_id: user.id,
      locale: "pl",
      // Tax wiring is gated behind STRIPE_TAX_ENABLED — without an active
      // tax registration in the Stripe dashboard, automatic_tax errors
      // out with "Stripe Tax is not active on this account". When the
      // merchant flips the flag, Stripe Tax automatically computes Polish
      // VAT and applies EU reverse-charge for verified VAT IDs.
      ...(env.stripeTaxEnabled
        ? {
            automatic_tax: { enabled: true },
            tax_id_collection: { enabled: true },
          }
        : {}),
      billing_address_collection: "required",
      // Persist the resulting customer object so the buyer's address /
      // VAT ID can be reused across orders (and surfaced in invoices).
      customer_creation: "always",
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: "Templify — produkty cyfrowe",
          metadata: {
            user_id: user.id,
            coupon_code: promoRule?.code ?? "",
            promo_code: promoRule?.code ?? "",
            order_bump_product_id: orderBumpProduct?.id ?? "",
            utm_source: trimMetadata(attribution?.utm_source),
            utm_medium: trimMetadata(attribution?.utm_medium),
            utm_campaign: trimMetadata(attribution?.utm_campaign),
          },
          custom_fields: [
            {
              name: "Format",
              value: "Plik HTML / PDF — natychmiastowy dostęp",
            },
          ],
          rendering_options: env.stripeTaxEnabled
            ? { amount_tax_display: "include_inclusive_tax" }
            : undefined,
        },
      },
      metadata: {
        user_id: user.id,
        user_email: user.email ?? parsed.data.email,
        coupon_code: promoRule?.code ?? "",
        coupon_discount_amount: String(Math.round(couponDiscountMinor / 100)),
        promo_code: promoRule?.code ?? "",
        order_bump_product_id: orderBumpProduct?.id ?? "",
        order_bump_percent_off: orderBumpProduct
          ? String(orderBumpConfig.percentOff)
          : "",
        order_bump_discount_amount: String(Math.round(orderBumpDiscountMinor / 100)),
        affiliate_ref: affiliateCode ?? "",
        gift_code: giftCodeRow?.code ?? "",
        gift_code_id: giftCodeRow?.id ?? "",
        utm_source: trimMetadata(attribution?.utm_source),
        utm_medium: trimMetadata(attribution?.utm_medium),
        utm_campaign: trimMetadata(attribution?.utm_campaign),
        utm_content: trimMetadata(attribution?.utm_content),
        utm_term: trimMetadata(attribution?.utm_term),
        referrer: trimMetadata(attribution?.referrer),
        landing_page: trimMetadata(attribution?.landing_page),
      },
      line_items: checkoutLines.map((line) => {
        return {
          quantity: line.quantity,
          price_data: {
            currency: "pln",
            unit_amount: line.unitAmount,
            // tax_behavior + tax_code are only meaningful when Stripe Tax
            // is active on the account; sending them otherwise is a no-op
            // but keeps the code path consistent for when Tax is enabled.
            ...(env.stripeTaxEnabled ? { tax_behavior: "inclusive" as const } : {}),
            product_data: {
              name: [
                line.product.name,
                line.kind === "order_bump" ? "oferta checkout" : null,
                promoRule?.label ?? null,
              ]
                .filter(Boolean)
                .join(" - "),
              description: line.product.short_description,
              ...(env.stripeTaxEnabled
                ? { tax_code: "txcd_35010000" }
                : {}),
              metadata: {
                product_id: line.product.id,
                product_slug: line.product.slug,
                checkout_line_kind: line.kind,
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
      orderBumpProductId: orderBumpProduct?.id ?? null,
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

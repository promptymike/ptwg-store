import { NextResponse } from "next/server";
import { z } from "zod";

import { env, getMissingStripeCheckoutEnv } from "@/lib/env";
import { hasCompleteSellerIdentity } from "@/lib/legal-readiness";
import { PURCHASES_ENABLED, purchaseUnavailablePayload } from "@/lib/purchase-availability";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getStripeServerClient } from "@/lib/stripe";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { getSiteSettingsSnapshot } from "@/lib/supabase/store";

const isDev = process.env.NODE_ENV !== "production";

const attributionSchema = z.object({
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(160).optional(),
  utm_content: z.string().trim().max(160).optional(),
  utm_term: z.string().trim().max(160).optional(),
  referrer: z.string().trim().max(300).optional(),
  landing_page: z.string().trim().max(300).optional(),
  captured_at: z.string().trim().max(80).optional(),
});

const checkoutBodySchema = z
  .object({
    attribution: attributionSchema.optional(),
    digitalDeliveryConsent: z.literal(true, {
      message: "Zaakceptuj regulamin i warunki natychmiastowej dostawy cyfrowej.",
    }),
  })
  .strict();

function trimMetadata(value: string | null | undefined, max = 300) {
  return value?.trim().slice(0, max) ?? "";
}

type RouteProps = {
  params: Promise<{ id: string }>;
};

type BundleProductRow = {
  position: number;
  products: {
    id: string;
    slug: string;
    name: string;
    short_description: string | null;
    status: string;
    is_active: boolean;
  } | null;
};

type BundleRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  bundle_products: BundleProductRow[];
};

export async function POST(request: Request, { params }: RouteProps) {
  if (!PURCHASES_ENABLED) {
    return NextResponse.json(purchaseUnavailablePayload(), { status: 503 });
  }

  const { id: bundleId } = await params;
  const refRaw = new URL(request.url).searchParams.get("ref")?.trim().toUpperCase();
  const refCandidate =
    refRaw && /^[A-Z0-9_-]{3,40}$/.test(refRaw) ? refRaw : null;
  const body = await request.json().catch(() => null);
  const parsedBody = checkoutBodySchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: parsedBody.error.issues[0]?.message ?? "Niepoprawne dane checkoutu.",
        code: "validation_error",
      },
      { status: 400 },
    );
  }
  const attribution = parsedBody.data.attribution;

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { message: "Brak konfiguracji Supabase.", code: "supabase_missing" },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        message: "Zaloguj się, aby kupić pakiet.",
        code: "unauthenticated",
      },
      { status: 401 },
    );
  }

  const rateLimit = consumeRateLimit("bundle-checkout", user.id, {
    limit: 10,
    windowMs: 10 * 60_000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Za dużo prób rozpoczęcia płatności.", code: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const siteSettings = await getSiteSettingsSnapshot();
  if (!hasCompleteSellerIdentity(siteSettings)) {
    return NextResponse.json(
      { message: "Płatności są chwilowo niedostępne.", code: "seller_identity_missing" },
      { status: 503 },
    );
  }

  const missingEnv = getMissingStripeCheckoutEnv();
  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        message: isDev
          ? `Brakuje konfiguracji Stripe: ${missingEnv.join(", ")}.`
          : "Płatności są chwilowo niedostępne.",
        code: "stripe_env_missing",
      },
      { status: 503 },
    );
  }

  // Service role bypasses RLS so we can read inactive bundles too — admins
  // sometimes leave a bundle disabled for a few minutes between edits and we
  // want a clear "ten pakiet jest niedostępny" rather than a 404.
  const adminSupabase = createSupabaseAdminClient();
  if (!adminSupabase) {
    return NextResponse.json(
      { message: "Brak konfiguracji Supabase admin.", code: "supabase_missing" },
      { status: 500 },
    );
  }

  const { data, error } = await adminSupabase
    .from("bundles")
    .select(
      "id, slug, name, description, price, is_active, bundle_products(position, products(id, slug, name, short_description, status, is_active))",
    )
    .eq("id", bundleId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { message: "Nie znaleziono pakietu.", code: "bundle_not_found" },
      { status: 404 },
    );
  }

  const bundle = data as BundleRow & { is_active: boolean };
  if (!bundle.is_active) {
    return NextResponse.json(
      { message: "Ten pakiet jest chwilowo niedostępny.", code: "bundle_inactive" },
      { status: 410 },
    );
  }

  const sortedItems = (bundle.bundle_products ?? [])
    .filter((bp) => bp.products)
    .sort((a, b) => a.position - b.position);

  const products = sortedItems
    .map((bp) => bp.products!)
    .filter((p) => p.is_active && p.status === "published");

  if (products.length === 0) {
    return NextResponse.json(
      {
        message: "Pakiet nie zawiera dostępnych produktów.",
        code: "bundle_empty",
      },
      { status: 422 },
    );
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json(
      { message: "Klient Stripe niedostępny.", code: "stripe_init_failed" },
      { status: 500 },
    );
  }

  // Validate the affiliate ref against the live affiliates table — same
  // pattern as the cart checkout endpoint. Unknown / inactive codes are
  // dropped silently rather than blocking the buy.
  let affiliateCode: string | null = null;
  if (refCandidate) {
    const { data: affiliate } = await adminSupabase
      .from("affiliates")
      .select("code, is_active")
      .eq("code", refCandidate)
      .maybeSingle();
    if (affiliate?.is_active) affiliateCode = affiliate.code;
  }

  // Bundle is sold as a single Stripe line item with the full bundle price.
  // The metadata trail (bundle_id + product_ids) lets the webhook fulfillment
  // expand the order back into per-product library entries — the buyer ends
  // up owning every product even though Stripe only saw one line.
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${env.siteUrl}/checkout/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.siteUrl}/#bundles`,
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      locale: "pl",
      metadata: {
        user_id: user.id,
        user_email: user.email ?? "",
        bundle_id: bundle.id,
        bundle_slug: bundle.slug,
        affiliate_ref: affiliateCode ?? "",
        utm_source: trimMetadata(attribution?.utm_source, 120),
        utm_medium: trimMetadata(attribution?.utm_medium, 120),
        utm_campaign: trimMetadata(attribution?.utm_campaign, 160),
        utm_content: trimMetadata(attribution?.utm_content, 160),
        utm_term: trimMetadata(attribution?.utm_term, 160),
        referrer: trimMetadata(attribution?.referrer, 300),
        landing_page: trimMetadata(attribution?.landing_page, 300),
        digital_delivery_consent: "true",
        digital_delivery_consent_at: new Date().toISOString(),
        // Comma-separated list — stays under Stripe's 500-char metadata
        // value limit even with 10+ products since UUIDs are 36 chars.
        bundle_product_ids: products.map((p) => p.id).join(","),
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: bundle.price * 100,
            product_data: {
              name: bundle.name,
              description:
                bundle.description ||
                `Pakiet zawiera: ${products.map((p) => p.name).join(", ")}`,
              metadata: {
                bundle_id: bundle.id,
                bundle_slug: bundle.slug,
                product_ids: products.map((p) => p.id).join(","),
              },
            },
          },
        },
      ],
    });

    if (!session.url) {
      return NextResponse.json(
        {
          message: "Stripe nie zwrócił adresu sesji.",
          code: "session_url_missing",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[checkout-bundle] failed", {
      bundleId,
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        message: isDev
          ? `Stripe odrzucił sesję: ${error instanceof Error ? error.message : "unknown"}`
          : "Nie udało się utworzyć sesji płatności.",
        code: "session_create_failed",
      },
      { status: 502 },
    );
  }
}

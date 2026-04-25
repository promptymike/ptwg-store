import { NextResponse } from "next/server";

import { env, getMissingStripeCheckoutEnv } from "@/lib/env";
import { getStripeServerClient } from "@/lib/stripe";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

const isDev = process.env.NODE_ENV !== "production";

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

export async function POST(_request: Request, { params }: RouteProps) {
  const { id: bundleId } = await params;

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
      ...(env.stripeTaxEnabled
        ? {
            automatic_tax: { enabled: true },
            tax_id_collection: { enabled: true },
          }
        : {}),
      billing_address_collection: "required",
      customer_creation: "always",
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Templify — ${bundle.name}`,
          metadata: {
            user_id: user.id,
            bundle_id: bundle.id,
            bundle_slug: bundle.slug,
          },
          rendering_options: env.stripeTaxEnabled
            ? { amount_tax_display: "include_inclusive_tax" }
            : undefined,
        },
      },
      metadata: {
        user_id: user.id,
        user_email: user.email ?? "",
        bundle_id: bundle.id,
        bundle_slug: bundle.slug,
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
            ...(env.stripeTaxEnabled
              ? { tax_behavior: "inclusive" as const }
              : {}),
            product_data: {
              name: bundle.name,
              description:
                bundle.description ||
                `Pakiet zawiera: ${products.map((p) => p.name).join(", ")}`,
              ...(env.stripeTaxEnabled
                ? { tax_code: "txcd_35010000" }
                : {}),
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

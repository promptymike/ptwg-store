import "server-only";

import type Stripe from "stripe";

import { sendEmail } from "@/lib/email/client";
import { renderOrderConfirmationEmail } from "@/lib/email/templates";
import { formatOrderNumber } from "@/lib/format";
import { getStripeServerClient } from "@/lib/stripe";
import { getCanonicalUrl } from "@/lib/seo";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/types/database.types";

type FulfillmentOptions = {
  eventId?: string;
  eventType?: string;
};

type FulfilledLineItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

type ExistingOrderRow = {
  id: string;
  stripe_checkout_session_id: string | null;
  email: string;
  total: number;
  subtotal: number;
  user_id: string;
  order_items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
};

export type CheckoutFulfillmentResult = {
  orderId: string;
  sessionId: string;
  email: string;
  total: number;
  subtotal: number;
  userId: string;
  items: FulfilledLineItem[];
};

function getProductMetadataFromLineItem(
  lineItem: Stripe.LineItem,
): Record<string, string> | null {
  const product = lineItem.price?.product;
  if (!product || typeof product === "string") return null;
  if ("deleted" in product && product.deleted) return null;
  return product.metadata ?? {};
}

async function expandBundleLineItem(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  bundleId: string,
  bundlePriceMinor: number,
  bundleName: string,
): Promise<FulfilledLineItem[]> {
  const { data, error } = await supabase
    .from("bundle_products")
    .select("position, products(id, name)")
    .eq("bundle_id", bundleId)
    .order("position", { ascending: true });

  type Row = { position: number; products: { id: string; name: string } | null };
  const rows = ((data as Row[]) ?? []).filter((r) => r.products);

  if (error || rows.length === 0) {
    throw new Error(
      `Nie udało się rozwinąć pakietu ${bundleId} (${bundleName}) do listy produktów.`,
    );
  }

  // Distribute the gross price across the bundle's products. Splitting in
  // grosze and assigning the remainder to the last item keeps the per-item
  // sum exactly equal to the bundle price — orders.subtotal will match
  // Stripe.amount_total without a rounding mismatch.
  const baseShare = Math.floor(bundlePriceMinor / rows.length);
  const remainder = bundlePriceMinor - baseShare * rows.length;

  return rows.map((row, idx) => {
    const product = row.products!;
    const grosze = baseShare + (idx === rows.length - 1 ? remainder : 0);
    return {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: Math.round(grosze / 100),
    };
  });
}

async function getCheckoutLineItems(
  stripe: ReturnType<typeof getStripeServerClient>,
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  sessionId: string,
) {
  if (!stripe) {
    throw new Error("Brak konfiguracji Stripe.");
  }

  const response = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
    expand: ["data.price.product"],
  });

  const items: FulfilledLineItem[] = [];

  for (const lineItem of response.data) {
    const metadata = getProductMetadataFromLineItem(lineItem);
    if (!metadata) continue;

    // Bundle path — line item represents a pack, expand to per-product
    // library entries using bundle_products metadata in our DB.
    if (metadata.bundle_id) {
      const bundleAmount =
        lineItem.amount_subtotal ?? lineItem.price?.unit_amount ?? 0;
      const expanded = await expandBundleLineItem(
        supabase,
        metadata.bundle_id,
        bundleAmount,
        lineItem.description || "Pakiet Templify",
      );
      items.push(...expanded);
      continue;
    }

    // Regular per-product path — same shape as before.
    if (!metadata.product_id) continue;
    const quantity = lineItem.quantity ?? 1;
    const unitAmount =
      lineItem.price?.unit_amount ?? Math.round(lineItem.amount_subtotal / quantity);
    items.push({
      productId: metadata.product_id,
      productName: lineItem.description || "Produkt cyfrowy",
      quantity,
      unitPrice: Math.round(unitAmount / 100),
    });
  }

  if (items.length === 0) {
    throw new Error("Checkout Session nie zawiera żadnych produktów do fulfillmentu.");
  }

  return items;
}

async function recordWebhookEvent(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  eventId: string | undefined,
  eventType: string | undefined,
  sessionId: string,
) {
  if (!eventId) {
    return;
  }

  await supabase.from("stripe_webhook_events").upsert(
    {
      id: eventId,
      event_type: eventType ?? "checkout.session.completed",
      checkout_session_id: sessionId,
    },
    {
      onConflict: "id",
      ignoreDuplicates: true,
    },
  );
}

async function getExistingFulfillmentResult(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  sessionId: string,
): Promise<CheckoutFulfillmentResult | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, stripe_checkout_session_id, email, total, subtotal, user_id, order_items(product_id, product_name, quantity, unit_price)",
    )
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const order = data as ExistingOrderRow;

  return {
    orderId: order.id,
    sessionId: order.stripe_checkout_session_id ?? sessionId,
    email: order.email,
    total: order.total,
    subtotal: order.subtotal,
    userId: order.user_id,
    items: order.order_items.map((item) => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    })),
  };
}

async function getCustomerName(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  userId: string,
) {
  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  return data?.full_name ?? null;
}

async function sendOrderConfirmationEmail(
  result: CheckoutFulfillmentResult,
  customerName: string | null,
  session: Stripe.Checkout.Session | null,
) {
  // The fulfillment table holds the canonical numbers — Stripe is the
  // source for the live invoice / receipt URLs since they are generated
  // asynchronously after the session completes. Both are nullable: the
  // template gracefully omits them if Stripe Tax / invoice creation is
  // not yet configured on the account.
  const invoice = session?.invoice;
  const invoiceUrl =
    typeof invoice === "object" && invoice && "hosted_invoice_url" in invoice
      ? invoice.hosted_invoice_url ?? null
      : null;
  // Stripe SDK 22 dropped PaymentIntent.charges in favour of `latest_charge`.
  // The hosted invoice URL covers the receipt for tax-enabled flows; we
  // skip the bare-receipt link rather than chase another retrieve() call.
  const receiptUrl: string | null = null;

  const orderNumber = formatOrderNumber(result.orderId, new Date().toISOString());
  const message = renderOrderConfirmationEmail({
    customerName,
    email: result.email,
    orderNumber,
    items: result.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    subtotal: result.subtotal,
    total: result.total,
    invoiceUrl,
    receiptUrl,
    libraryUrl: getCanonicalUrl("/biblioteka"),
  });

  try {
    const send = await sendEmail({
      to: result.email,
      subject: message.subject,
      html: message.html,
      text: message.text,
      tags: [
        { name: "type", value: "order-confirmation" },
        { name: "order_id", value: result.orderId },
      ],
    });
    if (send.skipped) {
      console.info("[fulfillment] order confirmation email skipped (Resend disabled)");
    } else if (send.error) {
      console.warn("[fulfillment] order confirmation email failed", send.error);
    }
  } catch (error) {
    // Email failures must never roll back fulfillment — the customer
    // already paid and Library access is already provisioned. Log loud,
    // continue silent.
    console.error("[fulfillment] order confirmation email crashed", error);
  }
}

async function ensureLibraryAccess(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  userId: string,
  orderId: string,
  items: FulfilledLineItem[],
) {
  if (items.length === 0) {
    return;
  }

  const { error } = await supabase.from("library_items").upsert(
    items.map((item) => ({
      user_id: userId,
      product_id: item.productId,
      order_id: orderId,
    })),
    {
      onConflict: "user_id,product_id",
      ignoreDuplicates: false,
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function fulfillCheckoutSession(
  sessionId: string,
  options: FulfillmentOptions = {},
): Promise<CheckoutFulfillmentResult> {
  const stripe = getStripeServerClient();
  const supabase = createSupabaseAdminClient();

  if (!stripe || !supabase) {
    throw new Error("Brakuje konfiguracji Stripe lub Supabase dla fulfillmentu.");
  }

  if (options.eventId) {
    const { data: existingEvent } = await supabase
      .from("stripe_webhook_events")
      .select("id")
      .eq("id", options.eventId)
      .maybeSingle();

    if (existingEvent) {
      const existingResult = await getExistingFulfillmentResult(supabase, sessionId);

      if (existingResult) {
        await ensureLibraryAccess(
          supabase,
          existingResult.userId,
          existingResult.orderId,
          existingResult.items,
        );
        return existingResult;
      }
    }
  }

  const existingOrder = await getExistingFulfillmentResult(supabase, sessionId);

  if (existingOrder) {
    await ensureLibraryAccess(
      supabase,
      existingOrder.userId,
      existingOrder.orderId,
      existingOrder.items,
    );
    await recordWebhookEvent(supabase, options.eventId, options.eventType, sessionId);
    return existingOrder;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Płatność dla tej sesji nie została jeszcze oznaczona jako opłacona.");
  }

  const userId = session.client_reference_id ?? session.metadata?.user_id;
  const email =
    session.customer_details?.email ??
    session.customer_email ??
    session.metadata?.user_email ??
    null;

  if (!userId || !email) {
    throw new Error("Brakuje danych użytkownika wymaganych do fulfillmentu.");
  }

  const items = await getCheckoutLineItems(stripe, supabase, sessionId);
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const total = session.amount_total ? Math.round(session.amount_total / 100) : subtotal;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  const orderPayload: TablesInsert<"orders"> & {
    stripe_checkout_session_id: string;
    stripe_payment_intent_id: string | null;
    stripe_customer_id: string | null;
  } = {
    user_id: userId,
    status: "fulfilled",
    email,
    currency: (session.currency ?? "pln").toUpperCase(),
    subtotal,
    total,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntentId,
    stripe_customer_id: customerId,
  };

  // We already called getExistingFulfillmentResult above and know no order
  // exists for this session, so a plain insert is both safe and avoids
  // depending on the ON CONFLICT arbiter for orders.stripe_checkout_session_id.
  // Migration 20260417120000 only created a **partial** unique index there,
  // which Postgres refuses to infer as an arbiter without the matching WHERE
  // clause — Supabase JS doesn't emit that clause, so the upsert used to
  // blow up with 42P10 on every successful payment. Plain insert + a
  // race-safe re-read below is the portable fix that works whether or not
  // migration 20260422120000 (which upgrades the partial index to a full
  // UNIQUE constraint) has been applied against this environment.
  const orderInsert = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("id")
    .single();

  const order = orderInsert.data;
  const orderError = orderInsert.error;

  if (orderError || !order) {
    // Concurrent fulfillment (e.g. webhook retry firing while the success
    // page is also being loaded) might have inserted the same session a
    // split second earlier. Re-read and return that existing fulfillment
    // instead of bubbling a duplicate-key error up to the UI.
    const raced = await getExistingFulfillmentResult(supabase, sessionId);

    if (raced) {
      await recordWebhookEvent(supabase, options.eventId, options.eventType, sessionId);
      return raced;
    }

    throw new Error(orderError?.message ?? "Nie udało się zapisać zamówienia.");
  }

  // Likewise plain insert here — order was just created above so there are no
  // existing rows in order_items for this order_id, and we don't need the
  // ON CONFLICT arbiter that the old upsert required.
  const { error: orderItemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      unit_price: item.unitPrice,
      quantity: item.quantity,
    })),
  );

  if (orderItemsError) {
    throw new Error(orderItemsError.message);
  }

  // Library items may genuinely pre-exist if the user bought the same
  // product earlier — keep the upsert so a repeat purchase just refreshes
  // the existing row's order_id. library_items has an inline
  //   unique (user_id, product_id)
  // constraint declared in CREATE TABLE (migration 20260417223000), so the
  // ON CONFLICT arbiter is valid without any follow-up migration.
  await ensureLibraryAccess(supabase, userId, order.id, items);

  await recordWebhookEvent(supabase, options.eventId, options.eventType, session.id);

  const result: CheckoutFulfillmentResult = {
    orderId: order.id,
    sessionId: session.id,
    email,
    total,
    subtotal,
    userId,
    items,
  };

  // Best-effort post-purchase email. We re-fetch the session with invoice
  // + payment_intent expanded so the template can include the hosted
  // invoice URL and the Stripe receipt link without storing them in our
  // own database.
  const customerName = await getCustomerName(supabase, userId);
  let expandedSession: Stripe.Checkout.Session | null = null;
  try {
    expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["invoice", "payment_intent"],
    });
  } catch (error) {
    console.warn("[fulfillment] could not expand session for email", error);
  }
  await sendOrderConfirmationEmail(result, customerName, expandedSession);

  return result;
}

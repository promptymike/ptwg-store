import "server-only";

import type Stripe from "stripe";

import { getStripeServerClient } from "@/lib/stripe";
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

function getProductIdFromLineItem(lineItem: Stripe.LineItem) {
  const product = lineItem.price?.product;

  if (!product || typeof product === "string") {
    return null;
  }

  if ("deleted" in product && product.deleted) {
    return null;
  }

  return product.metadata.product_id || null;
}

async function getCheckoutLineItems(
  stripe: ReturnType<typeof getStripeServerClient>,
  sessionId: string,
) {
  if (!stripe) {
    throw new Error("Brak konfiguracji Stripe.");
  }

  const response = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100,
    expand: ["data.price.product"],
  });

  const items = response.data
    .map((lineItem) => {
      const productId = getProductIdFromLineItem(lineItem);

      if (!productId) {
        return null;
      }

      const quantity = lineItem.quantity ?? 1;
      const unitAmount =
        lineItem.price?.unit_amount ?? Math.round(lineItem.amount_subtotal / quantity);

      return {
        productId,
        productName: lineItem.description || "Produkt cyfrowy",
        quantity,
        unitPrice: Math.round(unitAmount / 100),
      };
    })
    .filter((item): item is FulfilledLineItem => Boolean(item));

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
        return existingResult;
      }
    }
  }

  const existingOrder = await getExistingFulfillmentResult(supabase, sessionId);

  if (existingOrder) {
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

  const items = await getCheckoutLineItems(stripe, sessionId);
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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .upsert(orderPayload, {
      onConflict: "stripe_checkout_session_id",
      ignoreDuplicates: false,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    // Postgres 42P10 = "there is no unique or exclusion constraint matching
    // the ON CONFLICT specification". Usually means the Supabase DB is
    // missing the unique constraint on orders.stripe_checkout_session_id —
    // i.e. migration 20260422120000_fix_orders_upsert_conflict_target.sql
    // was never applied against this environment. Surface that hint so
    // whoever reads the checkout-success page (or server log) can fix it
    // instead of guessing.
    const baseMessage =
      orderError?.message ?? "Nie udało się zapisać zamówienia.";
    const needsMigrationHint =
      typeof orderError?.code === "string" && orderError.code === "42P10";
    throw new Error(
      needsMigrationHint
        ? `${baseMessage} (Postgres 42P10 — zaaplikuj migracj\u0119 20260422120000_fix_orders_upsert_conflict_target.sql przeciwko bazie Supabase.)`
        : baseMessage,
    );
  }

  const { error: orderItemsError } = await supabase.from("order_items").upsert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      unit_price: item.unitPrice,
      quantity: item.quantity,
    })),
    {
      onConflict: "order_id,product_id",
      ignoreDuplicates: false,
    },
  );

  if (orderItemsError) {
    throw new Error(orderItemsError.message);
  }

  const { error: libraryError } = await supabase.from("library_items").upsert(
    items.map((item) => ({
      user_id: userId,
      product_id: item.productId,
      order_id: order.id,
    })),
    {
      onConflict: "user_id,product_id",
      ignoreDuplicates: false,
    },
  );

  if (libraryError) {
    throw new Error(libraryError.message);
  }

  await recordWebhookEvent(supabase, options.eventId, options.eventType, session.id);

  return {
    orderId: order.id,
    sessionId: session.id,
    email,
    total,
    subtotal,
    userId,
    items,
  };
}

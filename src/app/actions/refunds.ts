"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/session";
import { getStripeServerClient } from "@/lib/stripe";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

const refundSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.enum([
    "duplicate",
    "fraudulent",
    "requested_by_customer",
    "other",
  ]),
  note: z.string().trim().max(500).optional().default(""),
  /** When true, also strip the buyer's library access for refunded items. */
  revokeLibrary: z.boolean().default(true),
});

async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Brak autoryzacji");
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Brak Supabase");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Brak uprawnień admina");
}

export type RefundOrderState =
  | { status: "idle" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

export async function refundOrderAction(
  _prev: RefundOrderState,
  formData: FormData,
): Promise<RefundOrderState> {
  try {
    await ensureAdmin();
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }

  const parsed = refundSchema.safeParse({
    orderId: formData.get("orderId"),
    reason: formData.get("reason") ?? "requested_by_customer",
    note: formData.get("note") ?? "",
    revokeLibrary: formData.get("revokeLibrary") === "on",
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Niepoprawne dane." };
  }

  const supabase = createSupabaseAdminClient();
  const stripe = getStripeServerClient();
  if (!supabase) return { status: "error", message: "Brak Supabase admin." };
  if (!stripe) return { status: "error", message: "Brak konfiguracji Stripe." };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, total, currency, status, user_id, stripe_payment_intent_id, refunded_at, order_items(product_id)",
    )
    .eq("id", parsed.data.orderId)
    .maybeSingle();
  if (orderError || !order) {
    return { status: "error", message: "Nie znaleziono zamówienia." };
  }
  if (order.refunded_at) {
    return { status: "error", message: "To zamówienie ma już zarejestrowany refund." };
  }
  if (!order.stripe_payment_intent_id) {
    return {
      status: "error",
      message: "Zamówienie nie ma payment_intent w Stripe — refund tylko ręcznie.",
    };
  }

  // Fire the Stripe refund first so we never leave the local order in a
  // refunded state without an actual refund on the customer's card.
  let stripeRefundId: string | null = null;
  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.stripe_payment_intent_id,
      reason:
        parsed.data.reason === "other"
          ? undefined
          : (parsed.data.reason as "duplicate" | "fraudulent" | "requested_by_customer"),
      metadata: {
        order_id: order.id,
        admin_note: parsed.data.note.slice(0, 200),
      },
    });
    stripeRefundId = refund.id;
  } catch (error) {
    return {
      status: "error",
      message: `Stripe odrzucił refund: ${(error as Error).message}`,
    };
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "refunded",
      refunded_at: new Date().toISOString(),
      refund_amount: order.total,
      refund_reason: parsed.data.note || parsed.data.reason,
      stripe_refund_id: stripeRefundId,
    })
    .eq("id", order.id);
  if (updateError) {
    return {
      status: "error",
      message:
        "Refund w Stripe ok, ale nie udało się zaktualizować lokalnego zamówienia. Sprawdź logi.",
    };
  }

  if (parsed.data.revokeLibrary) {
    type Item = { product_id: string };
    const productIds = (order.order_items as Item[] | null | undefined)
      ?.map((item) => item.product_id)
      .filter(Boolean) as string[];
    if (productIds && productIds.length > 0 && order.user_id) {
      await supabase
        .from("library_items")
        .delete()
        .eq("user_id", order.user_id)
        .in("product_id", productIds);
    }
  }

  revalidatePath("/admin/zamowienia");
  revalidatePath("/biblioteka");
  return {
    status: "ok",
    message: parsed.data.revokeLibrary
      ? "Refund wykonany. Dostęp do produktów w bibliotece klienta zostaje odebrany."
      : "Refund wykonany. Dostęp w bibliotece klienta pozostaje aktywny.",
  };
}

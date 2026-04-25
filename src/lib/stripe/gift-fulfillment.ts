import "server-only";

import type Stripe from "stripe";

import { sendEmail } from "@/lib/email/client";
import {
  renderGiftCodePurchaserEmail,
  renderGiftCodeRecipientEmail,
} from "@/lib/email/gift-templates";
import { generateGiftCode } from "@/lib/gift-codes";
import { getCanonicalUrl } from "@/lib/seo";
import { getStripeServerClient } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type GiftFulfillmentResult = {
  giftCodeId: string;
  code: string;
  amountMinor: number;
  purchaserEmail: string;
  recipientEmail: string | null;
};

export async function fulfillGiftPurchase(
  sessionId: string,
): Promise<GiftFulfillmentResult> {
  const stripe = getStripeServerClient();
  const supabase = createSupabaseAdminClient();

  if (!stripe || !supabase) {
    throw new Error("Brakuje konfiguracji Stripe lub Supabase dla vouchera.");
  }

  // Idempotency — if we already issued a code for this session, return it
  // instead of generating a new one. Webhooks can fire twice on retry.
  const { data: existing } = await supabase
    .from("gift_codes")
    .select(
      "id, code, amount_minor, purchaser_email, recipient_email",
    )
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (existing) {
    return {
      giftCodeId: existing.id,
      code: existing.code,
      amountMinor: existing.amount_minor,
      purchaserEmail: existing.purchaser_email,
      recipientEmail: existing.recipient_email,
    };
  }

  const session: Stripe.Checkout.Session =
    await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    throw new Error("Płatność za voucher nie jest oznaczona jako opłacona.");
  }
  if (session.metadata?.kind !== "gift_voucher") {
    throw new Error("Sesja nie jest sesją vouchera.");
  }

  const purchaserEmail = (
    session.customer_details?.email ??
    session.customer_email ??
    session.metadata?.purchaser_email ??
    ""
  )
    .trim()
    .toLowerCase();
  if (!purchaserEmail) {
    throw new Error("Brak adresu e-mail kupującego voucher.");
  }

  const amountMinor = session.amount_total ?? 0;
  if (amountMinor <= 0) {
    throw new Error("Brak kwoty vouchera w sesji Stripe.");
  }

  const recipientEmailRaw = session.metadata?.recipient_email?.trim() ?? "";
  const recipientEmail = recipientEmailRaw
    ? recipientEmailRaw.toLowerCase()
    : null;
  const recipientName = session.metadata?.recipient_name?.trim() || null;
  const message = session.metadata?.gift_message?.trim() || null;

  // Voucher is valid for one year from issuance — long enough for a real
  // gift, short enough to keep liability finite.
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  // Up to 5 attempts in the (statistically unlikely) case of a code clash.
  let inserted: { id: string; code: string } | null = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateGiftCode();
    const { data, error } = await supabase
      .from("gift_codes")
      .insert({
        code,
        amount_minor: amountMinor,
        currency: (session.currency ?? "pln").toLowerCase(),
        status: "issued",
        purchaser_email: purchaserEmail,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        message,
        stripe_checkout_session_id: sessionId,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        expires_at: expiresAt.toISOString(),
      })
      .select("id, code")
      .single();
    if (!error && data) {
      inserted = data;
      break;
    }
    if (error && error.code !== "23505") {
      // Real error, not a unique conflict — bail.
      throw new Error(`Nie udało się zapisać vouchera: ${error.message}`);
    }
  }
  if (!inserted) {
    throw new Error("Nie udało się wygenerować unikalnego kodu po 5 próbach.");
  }

  const cartUrl = getCanonicalUrl("/koszyk");
  const amountLabel = `${Math.round(amountMinor / 100)} zł`;

  const purchaserContent = renderGiftCodePurchaserEmail({
    code: inserted.code,
    amountLabel,
    recipientEmail,
    expiresAt,
    cartUrl,
  });
  await sendEmail({
    to: purchaserEmail,
    subject: purchaserContent.subject,
    html: purchaserContent.html,
    text: purchaserContent.text,
    tags: [
      { name: "type", value: "gift-purchaser" },
      { name: "amount", value: amountLabel },
    ],
  });

  if (recipientEmail) {
    const recipientContent = renderGiftCodeRecipientEmail({
      code: inserted.code,
      amountLabel,
      recipientName,
      message,
      cartUrl,
      expiresAt,
    });
    await sendEmail({
      to: recipientEmail,
      subject: recipientContent.subject,
      html: recipientContent.html,
      text: recipientContent.text,
      replyTo: purchaserEmail,
      tags: [
        { name: "type", value: "gift-recipient" },
        { name: "amount", value: amountLabel },
      ],
    });
  }

  return {
    giftCodeId: inserted.id,
    code: inserted.code,
    amountMinor,
    purchaserEmail,
    recipientEmail,
  };
}

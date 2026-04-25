import "server-only";

import { randomInt } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export {
  GIFT_CODE_DENOMINATIONS,
  GIFT_CODE_MAX,
  GIFT_CODE_MIN,
} from "@/lib/gift-constants";

// Codes are 12 chars from a 32-char alphabet (omit visually-confusable
// 0/O/1/I/L) → ~1.15e18 combinations. Conflicts are still possible so we
// retry on insert collision.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateGiftCode(): string {
  let raw = "";
  for (let i = 0; i < 12; i += 1) {
    raw += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return `GIFT-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

export function normalizeGiftCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export type GiftCodeRedemption =
  | { status: "ok"; amountMinor: number; code: string; id: string }
  | {
      status: "not_found" | "already_used" | "expired" | "wrong_currency";
      message: string;
    };

/**
 * Look up a gift code as a candidate discount at checkout. Does NOT mark it
 * as redeemed — the actual redemption happens after the order is saved
 * (markGiftCodeRedeemed). This split lets the buyer see the discount in
 * the cart UI before committing.
 */
export async function lookupGiftCode(
  rawCode: string,
  expectedCurrency = "pln",
): Promise<GiftCodeRedemption> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { status: "not_found", message: "Sprawdzenie kodu chwilowo niedostępne." };
  }
  const code = normalizeGiftCode(rawCode);
  if (!code.startsWith("GIFT-")) {
    return { status: "not_found", message: "To nie wygląda na kod podarunkowy." };
  }

  const { data: row } = await supabase
    .from("gift_codes")
    .select("id, code, amount_minor, currency, status, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (!row) {
    return { status: "not_found", message: "Kod nie został rozpoznany." };
  }
  if (row.status === "redeemed") {
    return { status: "already_used", message: "Ten kod został już wykorzystany." };
  }
  if (row.status === "refunded" || row.status === "expired") {
    return { status: "expired", message: "Ten kod nie jest już aktywny." };
  }
  if (row.status !== "issued") {
    return { status: "not_found", message: "Kod jeszcze nie jest aktywny." };
  }
  if (row.currency !== expectedCurrency) {
    return {
      status: "wrong_currency",
      message: "Ten kod nie pasuje do waluty zamówienia.",
    };
  }
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return { status: "expired", message: "Termin wykorzystania kodu minął." };
  }

  return {
    status: "ok",
    id: row.id,
    code: row.code,
    amountMinor: row.amount_minor,
  };
}

export async function markGiftCodeRedeemed({
  giftCodeId,
  orderId,
  userId,
}: {
  giftCodeId: string;
  orderId: string;
  userId: string;
}) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;
  await supabase
    .from("gift_codes")
    .update({
      status: "redeemed",
      redeemed_at: new Date().toISOString(),
      redeemed_by_user_id: userId,
      redeemed_order_id: orderId,
    })
    .eq("id", giftCodeId)
    .eq("status", "issued");
}

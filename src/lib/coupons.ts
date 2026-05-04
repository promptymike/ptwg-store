import "server-only";

import { applyPromoPercent, findPromoRule } from "@/lib/promo";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type ResolvedCoupon = {
  id: string | null;
  code: string;
  label: string;
  percentOff: number;
  source: "database" | "static";
};

type CouponRow = Pick<
  Tables<"coupon_codes">,
  | "id"
  | "code"
  | "label"
  | "percent_off"
  | "starts_at"
  | "expires_at"
  | "max_redemptions"
  | "redemption_count"
  | "is_active"
>;

export function normalizeCouponCode(rawCode: string | null | undefined) {
  const normalized = rawCode?.trim().toUpperCase() ?? "";
  return /^[A-Z0-9_-]{3,40}$/.test(normalized) ? normalized : "";
}

function isCouponCurrentlyValid(coupon: CouponRow, now = new Date()) {
  if (!coupon.is_active) return false;
  if (coupon.starts_at && new Date(coupon.starts_at) > now) return false;
  if (coupon.expires_at && new Date(coupon.expires_at) < now) return false;
  if (
    coupon.max_redemptions !== null &&
    coupon.redemption_count >= coupon.max_redemptions
  ) {
    return false;
  }
  return true;
}

export async function resolveCouponCode(
  rawCode: string | null | undefined,
): Promise<ResolvedCoupon | null> {
  const code = normalizeCouponCode(rawCode);
  if (!code) return null;

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("coupon_codes")
        .select(
          "id, code, label, percent_off, starts_at, expires_at, max_redemptions, redemption_count, is_active",
        )
        .eq("code", code)
        .maybeSingle();

      if (!error && data && isCouponCurrentlyValid(data as CouponRow)) {
        return {
          id: data.id,
          code: data.code,
          label: data.label || `Kod ${data.code}`,
          percentOff: data.percent_off,
          source: "database",
        };
      }
    } catch (error) {
      console.warn("[coupons] database lookup failed, falling back to static rules", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const staticRule = findPromoRule(code);
  return staticRule
    ? {
        id: null,
        code: staticRule.code,
        label: staticRule.label,
        percentOff: staticRule.percentOff,
        source: "static",
      }
    : null;
}

export function calculateCouponDiscountMinor(
  amountInMinorUnits: number,
  coupon: Pick<ResolvedCoupon, "percentOff"> | null,
) {
  if (!coupon) return 0;
  return Math.max(
    amountInMinorUnits - applyPromoPercent(amountInMinorUnits, coupon.percentOff),
    0,
  );
}

export type CouponRedemptionStatus =
  | "recorded"
  | "duplicate"
  | "inactive"
  | "exhausted"
  | "unknown"
  | "invalid_input";

export type CouponRedemptionResult = {
  status: CouponRedemptionStatus;
  couponId?: string;
  redemptionId?: string;
};

function parseRedemptionResult(payload: unknown): CouponRedemptionResult {
  if (!payload || typeof payload !== "object") {
    return { status: "unknown" };
  }

  const record = payload as Record<string, unknown>;
  const rawStatus = typeof record.status === "string" ? record.status : "";
  const allowed: CouponRedemptionStatus[] = [
    "recorded",
    "duplicate",
    "inactive",
    "exhausted",
    "unknown",
    "invalid_input",
  ];
  const status: CouponRedemptionStatus = allowed.includes(
    rawStatus as CouponRedemptionStatus,
  )
    ? (rawStatus as CouponRedemptionStatus)
    : "unknown";

  return {
    status,
    couponId: typeof record.coupon_id === "string" ? record.coupon_id : undefined,
    redemptionId:
      typeof record.redemption_id === "string" ? record.redemption_id : undefined,
  };
}

export async function recordCouponRedemption(params: {
  code: string | null | undefined;
  orderId: string;
  userId: string;
  stripeCheckoutSessionId: string;
  discountAmount: number;
}): Promise<CouponRedemptionResult | null> {
  const code = normalizeCouponCode(params.code);
  if (!code) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.rpc("record_coupon_redemption", {
      p_code: code,
      p_order_id: params.orderId,
      p_user_id: params.userId,
      p_session_id: params.stripeCheckoutSessionId,
      p_discount_amount: Math.max(0, Math.round(params.discountAmount)),
    });

    if (error) {
      throw error;
    }

    const result = parseRedemptionResult(data);

    if (result.status !== "recorded" && result.status !== "duplicate") {
      console.warn("[coupons] redemption skipped", {
        code,
        orderId: params.orderId,
        status: result.status,
      });
    }

    return result;
  } catch (error) {
    console.warn("[coupons] redemption recording failed", {
      code,
      orderId: params.orderId,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  calculateCouponDiscountMinor,
  resolveCouponCode,
} from "@/lib/coupons";

const validateCouponSchema = z.object({
  code: z.string().trim().min(3).max(40),
  subtotal: z.number().min(0).optional(),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = validateCouponSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Wpisz poprawny kod rabatowy.",
      },
      { status: 400 },
    );
  }

  const coupon = await resolveCouponCode(parsed.data.code);

  if (!coupon) {
    return NextResponse.json(
      {
        ok: false,
        message: "Ten kod nie działa albo wygasł.",
      },
      { status: 404 },
    );
  }

  const subtotalMinor = Math.round((parsed.data.subtotal ?? 0) * 100);
  const discountMinor = calculateCouponDiscountMinor(subtotalMinor, coupon);

  return NextResponse.json({
    ok: true,
    code: coupon.code,
    label: coupon.label,
    percentOff: coupon.percentOff,
    discountAmount: Math.round(discountMinor / 100),
    source: coupon.source,
  });
}

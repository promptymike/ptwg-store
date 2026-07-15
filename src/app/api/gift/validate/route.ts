import { NextResponse } from "next/server";
import { z } from "zod";

import { lookupGiftCode } from "@/lib/gift-codes";
import { consumeRateLimit, getClientAddress } from "@/lib/rate-limit";

const schema = z.object({
  code: z.string().trim().min(4).max(40),
});

export async function POST(request: Request) {
  const rateLimit = consumeRateLimit(
    "gift-validate",
    getClientAddress(request.headers),
    { limit: 20, windowMs: 5 * 60_000 },
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Za dużo prób. Odczekaj chwilę." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Niepoprawny format kodu." },
      { status: 400 },
    );
  }

  const result = await lookupGiftCode(parsed.data.code);
  if (result.status !== "ok") {
    return NextResponse.json(
      { ok: false, message: result.message, code: result.status },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    code: result.code,
    amountMinor: result.amountMinor,
  });
}

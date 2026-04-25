import { NextResponse } from "next/server";
import { z } from "zod";

import { lookupGiftCode } from "@/lib/gift-codes";

const schema = z.object({
  code: z.string().trim().min(4).max(40),
});

export async function POST(request: Request) {
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

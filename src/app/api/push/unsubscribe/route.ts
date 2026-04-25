import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const unsubscribeSchema = z.object({
  endpoint: z.string().url().max(2000),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { message: "Brak Supabase." },
      { status: 503 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = unsubscribeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Niepoprawne dane." },
      { status: 400 },
    );
  }

  // No auth check — the endpoint URL is itself a secret only the browser
  // knows, and we want the user to be able to clean up after switching
  // accounts even when their session has lapsed.
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", parsed.data.endpoint);

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const subscribeSchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({
    p256dh: z.string().min(1).max(500),
    auth: z.string().min(1).max(500),
  }),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { message: "Brak Supabase." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Push subscriptions are only available to logged-in users — we tie them
  // to user_id so we can do per-user broadcasts (e.g., "your library has a
  // new bonus").
  if (!user) {
    return NextResponse.json(
      { message: "Zaloguj się, aby włączyć powiadomienia." },
      { status: 401 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Niepoprawne dane subskrypcji." },
      { status: 400 },
    );
  }

  const ua = request.headers.get("user-agent")?.slice(0, 240) ?? null;

  // Endpoint is unique — any re-subscription from the same browser refreshes
  // the keys + last_seen and re-binds the row to the current user (handy
  // when one device is shared between accounts).
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        endpoint: parsed.data.endpoint,
        p256dh: parsed.data.keys.p256dh,
        auth: parsed.data.keys.auth,
        user_agent: ua,
        user_id: user.id,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );

  if (error) {
    return NextResponse.json(
      { message: "Nie udało się zapisać subskrypcji." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

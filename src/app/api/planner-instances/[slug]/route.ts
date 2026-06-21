import { NextResponse } from "next/server";

import { getInteractivePlanner } from "@/data/interactive-planners";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const MAX_PAYLOAD_BYTES = 1_500_000;
const MAX_KEYS = 800;

async function getContext(slug: string) {
  const planner = getInteractivePlanner(slug);
  if (!planner) return { error: NextResponse.json({ message: "Nie znaleziono planera." }, { status: 404 }) } as const;
  const supabase = await createSupabaseServerClient();
  const { data: auth } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!supabase || !auth.user) return { error: NextResponse.json({ message: "Zaloguj się, aby zapisywać dane." }, { status: 401 }) } as const;
  const { data: access } = await supabase.from("library_items").select("id").eq("user_id", auth.user.id).eq("product_id", planner.id).maybeSingle();
  if (!access) return { error: NextResponse.json({ message: "Brak dostępu do tego planera." }, { status: 403 }) } as const;
  return { planner, supabase, user: auth.user } as const;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const context = await getContext(slug);
  if ("error" in context) return context.error;

  const { data: existing, error } = await context.supabase.from("planner_instances").select("id, data, version, updated_at").eq("user_id", context.user.id).eq("product_id", context.planner.id).maybeSingle();
  if (error) return NextResponse.json({ message: "Nie udało się pobrać zapisu planera." }, { status: 500 });
  if (existing) return NextResponse.json(existing);

  const { data: created, error: createError } = await context.supabase.from("planner_instances").insert({ user_id: context.user.id, product_id: context.planner.id, data: {}, version: 1 }).select("id, data, version, updated_at").single();
  if (createError) return NextResponse.json({ message: "Nie udało się utworzyć prywatnego planera." }, { status: 500 });
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const context = await getContext(slug);
  if ("error" in context) return context.error;

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_PAYLOAD_BYTES) return NextResponse.json({ message: "Zapis planera jest zbyt duży." }, { status: 413 });
  let payload: { data?: unknown } | null = null;
  try {
    payload = JSON.parse(raw || "null") as { data?: unknown } | null;
  } catch {
    return NextResponse.json({ message: "Nieprawidłowy JSON." }, { status: 400 });
  }
  if (!payload || !payload.data || typeof payload.data !== "object" || Array.isArray(payload.data)) return NextResponse.json({ message: "Nieprawidłowy format danych." }, { status: 400 });
  const entries = Object.entries(payload.data);
  if (entries.length > MAX_KEYS || entries.some(([key, value]) => key.length > 200 || typeof value !== "string")) return NextResponse.json({ message: "Dane planera nie przeszły walidacji." }, { status: 400 });

  const { data: current } = await context.supabase.from("planner_instances").select("version").eq("user_id", context.user.id).eq("product_id", context.planner.id).maybeSingle();
  const { data: saved, error } = await context.supabase.from("planner_instances").upsert({ user_id: context.user.id, product_id: context.planner.id, data: Object.fromEntries(entries), version: (current?.version ?? 0) + 1 }, { onConflict: "user_id,product_id" }).select("id, version, updated_at").single();
  if (error) return NextResponse.json({ message: "Nie udało się zapisać zmian." }, { status: 500 });
  return NextResponse.json(saved);
}

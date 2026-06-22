import { NextResponse } from "next/server";

import { getInteractivePlanner } from "@/data/interactive-planners";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AiMessage = { role: "system" | "user" | "assistant"; content: string };

const MAX_MESSAGES = 30;
const MAX_TOTAL_CHARACTERS = 50_000;

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const planner = getInteractivePlanner(slug);
  if (!planner) return NextResponse.json({ error: { message: "Nie znaleziono planera." } }, { status: 404 });

  const supabase = await createSupabaseServerClient();
  const { data: auth } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!supabase || !auth.user) return NextResponse.json({ error: { message: "Zaloguj się, aby korzystać z asystenta AI." } }, { status: 401 });

  const { data: access } = await supabase
    .from("library_items")
    .select("id")
    .eq("user_id", auth.user.id)
    .eq("product_id", planner.id)
    .maybeSingle();
  if (!access) return NextResponse.json({ error: { message: "Brak dostępu do tego planera." } }, { status: 403 });
  if (!env.openRouterApiKey) return NextResponse.json({ error: { message: "Asystent AI jest chwilowo niedostępny." } }, { status: 503 });

  const payload = (await request.json().catch(() => null)) as { messages?: unknown; max_tokens?: unknown } | null;
  if (!payload || !Array.isArray(payload.messages) || payload.messages.length === 0 || payload.messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: { message: "Nieprawidłowa rozmowa." } }, { status: 400 });
  }

  const messages: AiMessage[] = [];
  let totalCharacters = 0;
  for (const candidate of payload.messages) {
    if (!candidate || typeof candidate !== "object") return NextResponse.json({ error: { message: "Nieprawidłowa wiadomość." } }, { status: 400 });
    const role = (candidate as { role?: unknown }).role;
    const content = (candidate as { content?: unknown }).content;
    if ((role !== "system" && role !== "user" && role !== "assistant") || typeof content !== "string") {
      return NextResponse.json({ error: { message: "Nieprawidłowa wiadomość." } }, { status: 400 });
    }
    totalCharacters += content.length;
    messages.push({ role, content });
  }
  if (totalCharacters > MAX_TOTAL_CHARACTERS) return NextResponse.json({ error: { message: "Rozmowa jest zbyt długa." } }, { status: 413 });

  const requestedTokens = typeof payload.max_tokens === "number" ? payload.max_tokens : 800;
  const maxTokens = Math.min(Math.max(Math.round(requestedTokens), 1), 1200);
  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.openRouterApiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": env.siteUrl,
      // Fetch headers must be ByteString-compatible. Product names can contain
      // Polish characters, so use the ASCII-only slug in the upstream label.
      "X-Title": `Templify - ${planner.slug}`,
    },
    body: JSON.stringify({ model: env.openRouterModel, messages, max_tokens: maxTokens }),
    signal: AbortSignal.timeout(40_000),
    cache: "no-store",
  }).catch(() => null);

  if (!upstream) return NextResponse.json({ error: { message: "Asystent AI nie odpowiedział na czas." } }, { status: 504 });
  const body = await upstream.json().catch(() => ({ error: { message: "Nieprawidłowa odpowiedź usługi AI." } }));
  return NextResponse.json(body, { status: upstream.status });
}

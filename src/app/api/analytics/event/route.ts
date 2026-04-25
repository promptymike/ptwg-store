import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const eventSchema = z.object({
  name: z.string().trim().min(1).max(60),
  visitorId: z.string().trim().min(4).max(80),
  experimentKey: z.string().trim().max(60).optional().or(z.literal("")),
  variant: z.string().trim().max(60).optional().or(z.literal("")),
  surface: z.string().trim().max(60).optional().or(z.literal("")),
  productId: z.string().uuid().optional().or(z.literal("")),
  path: z.string().trim().max(300).optional().or(z.literal("")),
  amount: z.number().int().min(0).max(10_000_000).optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

// Naive in-memory rate limit per visitor — drops anything over 60
// events / 60s. Vercel cold-starts each function so the bucket resets
// often, which is fine for the volume we expect on a niche storefront.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_PER_WINDOW = 60;
const buckets = new Map<string, number[]>();

function isRateLimited(visitorId: string) {
  const now = Date.now();
  const bucket = (buckets.get(visitorId) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
  );
  if (bucket.length >= RATE_LIMIT_PER_WINDOW) {
    buckets.set(visitorId, bucket);
    return true;
  }
  bucket.push(now);
  buckets.set(visitorId, bucket);
  return false;
}

export async function POST(request: Request) {
  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (isRateLimited(parsed.data.visitorId)) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    // Silently accept so analytics outages never spam the client console.
    return NextResponse.json({ ok: true, skipped: true });
  }

  const user = await getCurrentUser();
  const userAgent = request.headers.get("user-agent")?.slice(0, 280) ?? null;
  const referrer = request.headers.get("referer")?.slice(0, 280) ?? null;

  const insert = {
    event_name: parsed.data.name,
    visitor_id: parsed.data.visitorId,
    user_id: user?.id ?? null,
    experiment_key: parsed.data.experimentKey || null,
    variant: parsed.data.variant || null,
    surface: parsed.data.surface || null,
    product_id: parsed.data.productId || null,
    path: parsed.data.path || null,
    referrer,
    user_agent: userAgent,
    amount: parsed.data.amount ?? null,
    properties: (parsed.data.properties ?? {}) as Record<string, unknown> as never,
  };

  // Fire-and-forget — don't block the response on the DB write.
  void supabase
    .from("analytics_events")
    .insert(insert)
    .then(({ error }) => {
      if (error) console.warn("[analytics] insert failed", error.message);
    });

  return NextResponse.json({ ok: true });
}

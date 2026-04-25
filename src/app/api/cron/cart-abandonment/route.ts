import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/client";
import { renderCartAbandonmentEmail } from "@/lib/email/cart-abandonment-template";
import { env } from "@/lib/env";
import { sendPushToUser } from "@/lib/push";
import { getCanonicalUrl } from "@/lib/seo";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PROMO_CODE = "WRACAM10";
const PROMO_PERCENT_OFF = 10;

// Look back 24-48h: anyone who began checkout that long ago and never
// purchased gets one nudge. Going further back is spammy; going closer
// risks pinging someone who's still mid-flow.
const WINDOW_START_HOURS = 24;
const WINDOW_END_HOURS = 48;

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "unauthorized" },
    { status: 401 },
  );
}

async function handleCron(request: Request) {
  const expected = env.cronSecret;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "cron_secret_missing" },
      { status: 503 },
    );
  }
  const auth = request.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${expected}`) {
    return unauthorized();
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "supabase_missing" },
      { status: 500 },
    );
  }

  const now = Date.now();
  const windowEnd = new Date(
    now - WINDOW_START_HOURS * 60 * 60 * 1000,
  ).toISOString();
  const windowStart = new Date(
    now - WINDOW_END_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const { data: beginEvents } = await supabase
    .from("analytics_events")
    .select("user_id, created_at")
    .eq("event_name", "begin_checkout")
    .not("user_id", "is", null)
    .gte("created_at", windowStart)
    .lte("created_at", windowEnd)
    .order("created_at", { ascending: false })
    .limit(500);

  const candidateUserIds = new Set<string>();
  for (const row of beginEvents ?? []) {
    if (row.user_id) candidateUserIds.add(row.user_id);
  }

  if (candidateUserIds.size === 0) {
    return NextResponse.json({
      ok: true,
      candidates: 0,
      sent: { email: 0, push: 0 },
    });
  }

  // Anyone who already purchased after the window opened is no longer a
  // candidate — they finished the flow we wanted to nudge.
  const { data: purchasers } = await supabase
    .from("orders")
    .select("user_id")
    .in("user_id", [...candidateUserIds])
    .gte("created_at", windowStart)
    .in("status", ["paid", "fulfilled"]);

  const purchasedUserIds = new Set(
    (purchasers ?? []).map((row) => row.user_id),
  );

  // Skip anyone we've already pinged in the last 30 days.
  const recentSendCutoff = new Date(
    now - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const { data: recentSends } = await supabase
    .from("cart_abandonment_sends")
    .select("user_id")
    .in("user_id", [...candidateUserIds])
    .gte("sent_at", recentSendCutoff);

  const recentlyNotifiedIds = new Set(
    (recentSends ?? []).map((row) => row.user_id),
  );

  const finalCandidates = [...candidateUserIds].filter(
    (id) => !purchasedUserIds.has(id) && !recentlyNotifiedIds.has(id),
  );

  if (finalCandidates.length === 0) {
    return NextResponse.json({
      ok: true,
      candidates: candidateUserIds.size,
      eligible: 0,
      sent: { email: 0, push: 0 },
    });
  }

  // Resolve emails through profiles (we keep the auth.users mirror there).
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", finalCandidates);

  const cartUrl = getCanonicalUrl("/koszyk");
  const emailContent = renderCartAbandonmentEmail({
    cartUrl,
    promoCode: PROMO_CODE,
    percentOff: PROMO_PERCENT_OFF,
  });

  let emailSent = 0;
  let pushSent = 0;

  for (const profile of profiles ?? []) {
    if (!profile.email) continue;

    const emailResult = await sendEmail({
      to: profile.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: [{ name: "type", value: "cart-abandonment" }],
    });
    if (!emailResult.skipped && !("error" in emailResult)) {
      emailSent += 1;
      await supabase.from("cart_abandonment_sends").insert({
        user_id: profile.id,
        email: profile.email,
        channel: "email",
      });
    }

    const pushResult = await sendPushToUser(profile.id, {
      title: "Twój koszyk wciąż czeka",
      body: `Wróć i dokończ zakup — kod ${PROMO_CODE} daje −${PROMO_PERCENT_OFF}% na 48h.`,
      url: "/koszyk",
      tag: "cart-abandonment",
    });
    if (pushResult.delivered > 0) {
      pushSent += 1;
      await supabase.from("cart_abandonment_sends").insert({
        user_id: profile.id,
        email: profile.email,
        channel: "push",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    candidates: candidateUserIds.size,
    eligible: finalCandidates.length,
    sent: { email: emailSent, push: pushSent },
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

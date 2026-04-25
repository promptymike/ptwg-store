import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/client";
import {
  renderDripOfferEmail,
  renderDripTipEmail,
} from "@/lib/email/drip-templates";
import { env } from "@/lib/env";
import { getCanonicalUrl } from "@/lib/seo";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CAMPAIGNS = [
  { id: "tip_d3", afterDays: 3, kind: "tip" as const },
  { id: "offer_d7", afterDays: 7, kind: "offer" as const },
];

const PROMO_CODE_FOR_DRIP = "TEMPLIFY15";
const PROMO_PERCENT_OFF = 15;

type SubscriberRow = {
  id: string;
  email: string;
  created_at: string;
};

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

async function handleCron(request: Request) {
  // Vercel Cron sends an `Authorization: Bearer <CRON_SECRET>` header.
  // The secret is set in env so anyone hitting the URL without it gets a 401.
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
  const sentSummary: Array<{ campaign: string; sent: number; skipped: number }> = [];

  // Pre-fetch a sample preview link once per run rather than per email.
  const { data: sampleProduct } = await supabase
    .from("products")
    .select("slug, name, file_path")
    .eq("status", "published")
    .not("file_path", "is", null)
    .order("price", { ascending: true })
    .limit(1)
    .maybeSingle();
  const sampleUrl = sampleProduct
    ? getCanonicalUrl(`/api/produkty/${sampleProduct.slug}/probka`)
    : undefined;

  for (const campaign of CAMPAIGNS) {
    const cutoffMs = now - campaign.afterDays * 24 * 60 * 60 * 1000;
    const cutoffIso = new Date(cutoffMs).toISOString();
    const upperBoundIso = new Date(
      cutoffMs - 24 * 60 * 60 * 1000,
    ).toISOString();

    // Only consider subscribers whose signup falls inside a one-day
    // window — keeps the daily run cheap and prevents the same person
    // getting both day-3 and day-4 mail if the cron stalls.
    const { data: candidates } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, created_at")
      .lte("created_at", cutoffIso)
      .gte("created_at", upperBoundIso)
      .is("unsubscribed_at", null)
      .eq("consent", true)
      .limit(500);

    let sent = 0;
    let skipped = 0;
    for (const row of (candidates as SubscriberRow[]) ?? []) {
      const { data: existing } = await supabase
        .from("newsletter_sends")
        .select("id")
        .eq("subscriber_id", row.id)
        .eq("campaign", campaign.id)
        .maybeSingle();
      if (existing) {
        skipped++;
        continue;
      }

      const message =
        campaign.kind === "tip"
          ? renderDripTipEmail({
              sampleUrl,
              sampleTitle: sampleProduct?.name,
            })
          : renderDripOfferEmail({
              promoCode: PROMO_CODE_FOR_DRIP,
              percentOff: PROMO_PERCENT_OFF,
              productsUrl: getCanonicalUrl("/produkty"),
            });

      try {
        const result = await sendEmail({
          to: row.email,
          subject: message.subject,
          html: message.html,
          text: message.text,
          tags: [
            { name: "type", value: "newsletter-drip" },
            { name: "campaign", value: campaign.id },
          ],
        });
        if (result.skipped) {
          skipped++;
          continue;
        }
        await supabase.from("newsletter_sends").insert({
          subscriber_id: row.id,
          campaign: campaign.id,
          resend_message_id: "id" in result ? result.id ?? null : null,
        });
        sent++;
      } catch (error) {
        console.error("[drip] send failed", row.email, error);
        skipped++;
      }
    }

    sentSummary.push({ campaign: campaign.id, sent, skipped });
  }

  return NextResponse.json({ ok: true, summary: sentSummary });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/client";
import { renderReviewRequestEmail } from "@/lib/email/review-request-template";
import { env } from "@/lib/env";
import { getCanonicalUrl } from "@/lib/seo";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Day-5 review nudge: long enough that the buyer has had time to actually
// read, short enough that the experience is still fresh. Daily run with a
// 24h candidate window so timing slop never double-emails.
const DAYS_AFTER_GRANT = 5;

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
    now - DAYS_AFTER_GRANT * 24 * 60 * 60 * 1000,
  ).toISOString();
  const windowStart = new Date(
    now - (DAYS_AFTER_GRANT + 1) * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: items } = await supabase
    .from("library_items")
    .select(
      "user_id, product_id, created_at, products(name, slug), profiles(email)",
    )
    .gte("created_at", windowStart)
    .lte("created_at", windowEnd)
    .limit(500);

  if (!items || items.length === 0) {
    return NextResponse.json({ ok: true, candidates: 0, sent: 0 });
  }

  type Row = (typeof items)[number] & {
    products?: { name: string; slug: string } | null;
    profiles?: { email: string | null } | null;
  };

  let sent = 0;
  let skippedAlreadyAsked = 0;
  let skippedAlreadyReviewed = 0;

  for (const raw of items as Row[]) {
    const product = raw.products;
    const email = raw.profiles?.email;
    if (!product || !email) continue;

    const { data: existingSend } = await supabase
      .from("review_request_sends")
      .select("id")
      .eq("user_id", raw.user_id)
      .eq("product_id", raw.product_id)
      .maybeSingle();
    if (existingSend) {
      skippedAlreadyAsked += 1;
      continue;
    }

    const { data: existingReview } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("user_id", raw.user_id)
      .eq("product_id", raw.product_id)
      .maybeSingle();
    if (existingReview) {
      skippedAlreadyReviewed += 1;
      continue;
    }

    const productUrl = getCanonicalUrl(`/produkty/${product.slug}`);
    // The product page anchors the review form with #recenzje so the buyer
    // lands directly on the rating widget instead of having to scroll.
    const reviewUrl = `${productUrl}#recenzje`;

    const message = renderReviewRequestEmail({
      productName: product.name,
      productUrl,
      reviewUrl,
    });

    const result = await sendEmail({
      to: email,
      subject: message.subject,
      html: message.html,
      text: message.text,
      tags: [
        { name: "type", value: "review-request" },
        { name: "product_slug", value: product.slug },
      ],
    });

    if (result.skipped || "error" in result) continue;

    await supabase.from("review_request_sends").insert({
      user_id: raw.user_id,
      product_id: raw.product_id,
      email,
    });
    sent += 1;
  }

  return NextResponse.json({
    ok: true,
    candidates: items.length,
    sent,
    skipped: {
      alreadyAsked: skippedAlreadyAsked,
      alreadyReviewed: skippedAlreadyReviewed,
    },
  });
}

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

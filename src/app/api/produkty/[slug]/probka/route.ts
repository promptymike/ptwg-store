import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { createProductFileSignedUrl } from "@/lib/supabase/storage";
import { extractFirstHtmlFromZip } from "@/lib/zip";

type SampleRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

const SAMPLE_CHAR_BUDGET = 8000; // ~3-5 stron tekstu A4

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Crude but dependency-free truncation. Walks the rendered HTML, copies
// content tags as-is until we have ~SAMPLE_CHAR_BUDGET worth of text. We
// always close any open <h*>, <p>, <ul>, <ol>, <li> we cut into so the
// preview stays parseable; everything past the budget is dropped.
function truncateBodyHtml(bodyHtml: string, budget: number) {
  let textLen = 0;
  let cursor = 0;
  let truncated = false;
  const out: string[] = [];

  while (cursor < bodyHtml.length) {
    const next = bodyHtml.indexOf("<", cursor);
    if (next === -1) {
      const tail = bodyHtml.slice(cursor);
      out.push(tail);
      textLen += tail.length;
      break;
    }
    if (next > cursor) {
      const text = bodyHtml.slice(cursor, next);
      out.push(text);
      textLen += text.length;
    }
    const closeIdx = bodyHtml.indexOf(">", next);
    if (closeIdx === -1) break;
    out.push(bodyHtml.slice(next, closeIdx + 1));
    cursor = closeIdx + 1;
    if (textLen >= budget) {
      truncated = true;
      break;
    }
  }
  return { html: out.join(""), truncated };
}

function buildSampleResponse({
  productName,
  productSlug,
  bodyHtml,
}: {
  productName: string;
  productSlug: string;
  bodyHtml: string;
}) {
  const truncated = truncateBodyHtml(bodyHtml, SAMPLE_CHAR_BUDGET);

  const banner = `<div class="templify-sample-banner" role="note">
    <div class="templify-sample-banner__inner">
      <span class="templify-sample-banner__pill">Bezpłatna próbka</span>
      <strong>${escapeHtml(productName)}</strong>
      <span class="templify-sample-banner__hint">— pierwszych kilka stron, żebyś wiedział czego się spodziewać</span>
    </div>
  </div>`;

  const fade = `<div class="templify-sample-fade" aria-hidden></div>`;

  const cta = `<div class="templify-sample-cta">
    <h2>Chcesz przeczytać dalej?</h2>
    <p>To była tylko próbka. Pełna wersja trafia do Twojej biblioteki natychmiast po zakupie — czytasz w przeglądarce, zapisujesz postęp, masz zakładki i 14 dni na zwrot.</p>
    <div class="templify-sample-cta__actions">
      <a class="templify-sample-cta__primary" href="/produkty/${escapeHtml(productSlug)}">Kup teraz pełną wersję</a>
      <a class="templify-sample-cta__secondary" href="/produkty">Przeglądaj wszystkie ebooki</a>
    </div>
  </div>`;

  const styles = `<style>
    :root { color-scheme: light; }
    html, body { background: #faf6f0; color: #1a1612; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; }
    body { padding: 96px 16px 0 !important; max-width: 720px; margin: 0 auto; }
    body * { max-width: 100%; }
    img { max-width: 100%; height: auto; }
    h1, h2, h3 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; letter-spacing: -0.4px; line-height: 1.2; }
    h1 { font-size: 2.4rem; margin: 1.4em 0 0.6em; }
    h2 { font-size: 1.8rem; margin: 1.2em 0 0.5em; }
    p, li { font-size: 1.02rem; }
    a { color: #b9763a; }
    .templify-sample-banner { position: fixed; top: 0; left: 0; right: 0; z-index: 2147483646; background: rgba(20,18,15,0.92); color: #f5f1ea; padding: 12px 16px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 8px 24px -12px rgba(0,0,0,0.4); }
    .templify-sample-banner__inner { max-width: 720px; margin: 0 auto; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 14px; }
    .templify-sample-banner__pill { padding: 4px 10px; border-radius: 999px; background: rgba(226,188,114,0.18); color: #f5d290; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; }
    .templify-sample-banner__hint { color: rgba(245,241,234,0.7); font-size: 13px; }
    .templify-sample-fade { position: relative; height: 220px; margin-top: -160px; pointer-events: none; background: linear-gradient(to bottom, rgba(250,246,240,0) 0%, #faf6f0 70%); }
    .templify-sample-cta { background: #fff; border: 1px solid #e9e1d4; border-radius: 22px; padding: 32px; margin: 8px 0 96px; box-shadow: 0 24px 60px -32px rgba(0,0,0,0.25); text-align: center; }
    .templify-sample-cta h2 { margin: 0 0 12px; font-size: 1.7rem; color: #1a1612; }
    .templify-sample-cta p { margin: 0 0 20px; color: #6b6256; font-size: 0.98rem; }
    .templify-sample-cta__actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .templify-sample-cta__primary { display: inline-block; padding: 14px 26px; border-radius: 999px; background: #b9763a; color: #fff; text-decoration: none; font-weight: 700; font-size: 15px; }
    .templify-sample-cta__secondary { display: inline-block; padding: 14px 22px; border-radius: 999px; border: 1px solid #d8cfc0; color: #3a2e1e; text-decoration: none; font-weight: 600; font-size: 15px; }
    @media (max-width: 520px) {
      body { padding: 92px 14px 0 !important; }
      .templify-sample-cta { padding: 24px; border-radius: 18px; }
      .templify-sample-cta h2 { font-size: 1.4rem; }
    }
  </style>`;

  const noindex = `<meta name="robots" content="noindex, nofollow" />`;

  return `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${noindex}
    <title>Próbka — ${escapeHtml(productName)}</title>
    ${styles}
  </head>
  <body>
    ${banner}
    ${truncated.html}
    ${truncated.truncated ? fade : ""}
    ${cta}
  </body>
</html>`;
}

export async function GET(_request: Request, { params }: SampleRouteProps) {
  const { slug } = await params;

  const adminSupabase = createSupabaseAdminClient();
  if (!adminSupabase) {
    return new Response("Brak konfiguracji Supabase.", { status: 500 });
  }

  const { data: product, error } = await adminSupabase
    .from("products")
    .select("id, slug, name, status, file_path")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !product || product.status !== "published" || !product.file_path) {
    return new Response("Próbka jest niedostępna dla tego produktu.", {
      status: 404,
    });
  }

  const signedUrl = await createProductFileSignedUrl(product.file_path, 120);
  if (!signedUrl) {
    return new Response("Nie udało się przygotować pliku z próbką.", {
      status: 500,
    });
  }

  const upstream = await fetch(signedUrl, { cache: "no-store" });
  if (!upstream.ok) {
    return new Response("Nie udało się pobrać pliku produktu.", { status: 502 });
  }

  const isZip = product.file_path.toLowerCase().endsWith(".zip");
  let html: string | null = null;

  if (isZip) {
    const buffer = Buffer.from(await upstream.arrayBuffer());
    const extracted = await extractFirstHtmlFromZip(buffer).catch(() => null);
    html = extracted?.html ?? null;
  } else if (product.file_path.toLowerCase().endsWith(".html")) {
    html = await upstream.text();
  }

  if (!html) {
    return new Response("Próbka jest dostępna tylko dla ebooków HTML.", {
      status: 415,
    });
  }

  // Strip <head> + open/close body tags so we keep just the article content
  // and replace it with our reader chrome instead. We also drop any inline
  // <script> tags that the original ebook may include — sample is read-only.
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body\s*>/i);
  let body = bodyMatch ? bodyMatch[1] : html;
  body = body.replace(/<script[\s\S]*?<\/script>/gi, "");

  const sampleHtml = buildSampleResponse({
    productName: product.name,
    productSlug: product.slug,
    bodyHtml: body,
  });

  return new NextResponse(sampleHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "no-referrer",
    },
  });
}

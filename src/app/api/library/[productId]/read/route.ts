import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { createProductFileSignedUrl } from "@/lib/supabase/storage";
import { extractFirstHtmlFromZip } from "@/lib/zip";

type ReadRouteProps = {
  params: Promise<{
    productId: string;
  }>;
};

function buildAppUrl(request: Request, path: string) {
  return new URL(path, env.appUrl || request.url);
}

function redirectWithMessage(
  request: Request,
  path: string,
  type: "success" | "error",
  message: string,
) {
  const url = buildAppUrl(request, path);
  url.searchParams.set("type", type);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

// Tiny client-side script injected into every reader response. Persists
// the user's furthest-reached scroll position in localStorage so the
// library page can show "12% przeczytane" badges when they come back.
// Also mounts a floating reader chrome (back button + live progress bar)
// so the in-browser reader feels like a first-class app, not a raw HTML
// dump. Everything is dependency-free so it runs before any of the
// ebook's own assets.
function renderReaderEnhancementScript(productId: string, productName: string) {
  const safeId = JSON.stringify(productId);
  const safeName = JSON.stringify(productName);
  return `<style>
    .templify-reader-chrome{position:fixed;top:0;left:0;right:0;z-index:2147483646;display:flex;align-items:center;gap:12px;padding:10px 16px;background:rgba(20,18,15,0.85);backdrop-filter:saturate(180%) blur(14px);-webkit-backdrop-filter:saturate(180%) blur(14px);color:#f5f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:13px;line-height:1.4;box-shadow:0 8px 24px -12px rgba(0,0,0,0.4);transform:translateY(0);transition:transform .25s ease}
    .templify-reader-chrome.is-hidden{transform:translateY(-100%)}
    .templify-reader-chrome a.templify-back{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,0.08);color:#f5f1ea;text-decoration:none;font-weight:600;border:1px solid rgba(255,255,255,0.12);transition:background .2s ease}
    .templify-reader-chrome a.templify-back:hover{background:rgba(255,255,255,0.16)}
    .templify-reader-chrome .templify-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(245,241,234,0.92);font-weight:500;letter-spacing:0.02em}
    .templify-reader-chrome .templify-pct{font-variant-numeric:tabular-nums;font-weight:600;font-size:12px;color:rgba(245,241,234,0.92);min-width:42px;text-align:right}
    .templify-reader-chrome .templify-toggle{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:999px;background:transparent;border:0;color:rgba(245,241,234,0.7);cursor:pointer;transition:background .2s ease,color .2s ease}
    .templify-reader-chrome .templify-toggle:hover{background:rgba(255,255,255,0.08);color:#f5f1ea}
    .templify-reader-progress{position:absolute;left:0;right:0;bottom:0;height:2px;background:transparent;overflow:hidden}
    .templify-reader-progress .templify-fill{display:block;height:100%;width:0%;background:linear-gradient(90deg,#e2bc72,#f5d290);transition:width .15s ease-out}
    .templify-reader-show{position:fixed;top:8px;right:12px;z-index:2147483646;width:36px;height:36px;border-radius:999px;border:1px solid rgba(0,0,0,0.12);background:rgba(255,255,255,0.85);backdrop-filter:saturate(180%) blur(10px);color:#1a1612;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px -12px rgba(0,0,0,0.4)}
    .templify-reader-chrome.is-hidden ~ .templify-reader-show{display:inline-flex}
    body{padding-top:64px !important}
    @media (max-width:520px){
      .templify-reader-chrome{padding:8px 12px;font-size:12px;gap:8px}
      .templify-reader-chrome a.templify-back{padding:6px 10px;font-size:12px}
      .templify-reader-chrome a.templify-back .templify-back-label{display:none}
      body{padding-top:56px !important}
    }
    @media print{.templify-reader-chrome,.templify-reader-show{display:none !important}body{padding-top:0 !important}}
  </style>
  <script>(function(){
    try {
      var key = "templify:reading-progress:" + ${safeId};
      var name = ${safeName};
      var saved = parseFloat(localStorage.getItem(key) || "0");
      if (!Number.isFinite(saved) || saved < 0) saved = 0;
      var maxPercent = saved;
      var fillEl = null;
      var pctEl = null;
      var chromeEl = null;
      var showEl = null;
      function read() {
        var el = document.scrollingElement || document.documentElement;
        var scrollable = el.scrollHeight - el.clientHeight;
        if (scrollable <= 0) return 100;
        var pct = (el.scrollTop / scrollable) * 100;
        return Math.max(0, Math.min(100, pct));
      }
      function persist() {
        var current = read();
        var rounded = Math.round(current);
        if (fillEl) fillEl.style.width = current.toFixed(1) + "%";
        if (pctEl) pctEl.textContent = rounded + "%";
        if (rounded > maxPercent) {
          maxPercent = rounded;
          try { localStorage.setItem(key, String(maxPercent)); } catch (e) {}
        }
      }
      function buildChrome() {
        chromeEl = document.createElement("div");
        chromeEl.className = "templify-reader-chrome";
        chromeEl.setAttribute("role", "toolbar");
        chromeEl.setAttribute("aria-label", "Pasek czytnika");
        chromeEl.innerHTML =
          '<a class="templify-back" href="/biblioteka" aria-label="Wróć do biblioteki">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>' +
          '<span class="templify-back-label">Biblioteka</span></a>' +
          '<span class="templify-title"></span>' +
          '<span class="templify-pct" aria-live="polite">0%</span>' +
          '<button type="button" class="templify-toggle" aria-label="Ukryj pasek">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg>' +
          '</button>' +
          '<div class="templify-reader-progress"><span class="templify-fill"></span></div>';
        document.body.insertBefore(chromeEl, document.body.firstChild);

        showEl = document.createElement("button");
        showEl.type = "button";
        showEl.className = "templify-reader-show";
        showEl.setAttribute("aria-label", "Pokaż pasek czytnika");
        showEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
        document.body.appendChild(showEl);

        var titleEl = chromeEl.querySelector(".templify-title");
        if (titleEl) titleEl.textContent = name || document.title || "";
        fillEl = chromeEl.querySelector(".templify-fill");
        pctEl = chromeEl.querySelector(".templify-pct");

        var toggleBtn = chromeEl.querySelector(".templify-toggle");
        if (toggleBtn) {
          toggleBtn.addEventListener("click", function () {
            chromeEl.classList.add("is-hidden");
          });
        }
        showEl.addEventListener("click", function () {
          chromeEl.classList.remove("is-hidden");
        });
      }
      window.addEventListener("DOMContentLoaded", function () {
        if (document.body) buildChrome();
        persist();
      });
      window.addEventListener("load", function () {
        if (saved > 0 && saved < 99) {
          var el = document.scrollingElement || document.documentElement;
          var target = (saved / 100) * (el.scrollHeight - el.clientHeight);
          el.scrollTo({ top: target, behavior: "instant" });
        }
        try {
          localStorage.setItem(
            "templify:reading-opened:" + ${safeId},
            String(Date.now())
          );
        } catch (e) {}
        persist();
      });
      var queued = false;
      window.addEventListener("scroll", function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () {
          persist();
          queued = false;
        });
      }, { passive: true });
      window.addEventListener("beforeunload", persist);
    } catch (e) { /* progress is best-effort, never block reading */ }
  })();</script>`;
}

function injectReaderScript(
  html: string,
  productId: string,
  productName: string,
) {
  const script = renderReaderEnhancementScript(productId, productName);
  const headCloseIdx = html.search(/<\/head\s*>/i);
  if (headCloseIdx !== -1) {
    return html.slice(0, headCloseIdx) + script + html.slice(headCloseIdx);
  }
  // No </head>? Insert at the very top, browsers tolerate it.
  return script + html;
}

export async function GET(request: Request, { params }: ReadRouteProps) {
  const { productId } = await params;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Brak konfiguracji Supabase dla otwierania plików.",
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      buildAppUrl(
        request,
        `/logowanie?next=${encodeURIComponent("/biblioteka")}`,
      ),
    );
  }

  const { data: libraryItem, error: libraryError } = await supabase
    .from("library_items")
    .select("id, product_id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (libraryError || !libraryItem) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Nie masz dostępu do tego produktu w bibliotece.",
    );
  }

  const adminSupabase = createSupabaseAdminClient();

  if (!adminSupabase) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Brak konfiguracji Supabase dla otwierania plików.",
    );
  }

  const { data: product, error: productError } = await adminSupabase
    .from("products")
    .select("name, file_path")
    .eq("id", libraryItem.product_id)
    .maybeSingle();

  if (productError || !product || !product.file_path) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Plik dla tego produktu nie został jeszcze dodany.",
    );
  }

  const signedUrl = await createProductFileSignedUrl(product.file_path, 120);
  if (!signedUrl) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Nie udało się wygenerować bezpiecznego linku do pliku.",
    );
  }

  const upstream = await fetch(signedUrl, { cache: "no-store" });
  if (!upstream.ok) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Nie udało się pobrać pliku z biblioteki.",
    );
  }

  const upstreamType = upstream.headers.get("content-type") ?? "";
  const isZip = product.file_path.toLowerCase().endsWith(".zip");
  let html: string | null = null;

  if (isZip) {
    const buffer = Buffer.from(await upstream.arrayBuffer());
    const extracted = await extractFirstHtmlFromZip(buffer).catch(() => null);
    html = extracted?.html ?? null;
  } else if (
    upstreamType.startsWith("text/html") ||
    product.file_path.toLowerCase().endsWith(".html")
  ) {
    html = await upstream.text();
  }

  if (!html) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Ten produkt jest w formacie, który chwilowo nie ma podglądu w przeglądarce. Pobierz go zamiast tego.",
    );
  }

  const enhanced = injectReaderScript(
    html,
    libraryItem.product_id,
    product.name ?? "",
  );

  return new Response(enhanced, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "no-referrer",
    },
  });
}

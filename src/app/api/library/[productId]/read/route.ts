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
// The script is intentionally inline + dependency-free so it runs
// before any of the ebook's own assets.
function renderReaderEnhancementScript(productId: string) {
  const safeId = JSON.stringify(productId);
  return `<script>(function(){
    try {
      var key = "templify:reading-progress:" + ${safeId};
      var saved = parseFloat(localStorage.getItem(key) || "0");
      if (!Number.isFinite(saved) || saved < 0) saved = 0;
      var maxPercent = saved;
      function read() {
        var el = document.scrollingElement || document.documentElement;
        var scrollable = el.scrollHeight - el.clientHeight;
        if (scrollable <= 0) return 100;
        var pct = (el.scrollTop / scrollable) * 100;
        return Math.max(0, Math.min(100, Math.round(pct)));
      }
      function persist() {
        var current = read();
        if (current > maxPercent) {
          maxPercent = current;
          try { localStorage.setItem(key, String(maxPercent)); } catch (e) {}
        }
      }
      // Restore prior position after first paint so the layout is stable.
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

function injectReaderScript(html: string, productId: string) {
  const script = renderReaderEnhancementScript(productId);
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

  const enhanced = injectReaderScript(html, libraryItem.product_id);

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

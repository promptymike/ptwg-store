import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { renderReaderEnhancement } from "@/lib/reader/enhancement";
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

function injectReaderScript(
  html: string,
  productId: string,
  productName: string,
) {
  const script = renderReaderEnhancement(productId, productName);
  const headCloseIdx = html.search(/<\/head\s*>/i);
  if (headCloseIdx !== -1) {
    return html.slice(0, headCloseIdx) + script + html.slice(headCloseIdx);
  }
  // No </head>? Insert at the very top, browsers tolerate it.
  return script + html;
}

function getSafeInlinePdfName(productName: string) {
  const normalizedBaseName = productName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${normalizedBaseName || "templify-ebook"}.pdf`;
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
    .select("id, product_id, instance_path")
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

  // Per-account instance ("klatka"): each customer reads from their own
  // copy provisioned at fulfillment. If the copy is missing (legacy
  // purchase or a copy that failed at fulfillment time) we still serve the
  // master file so the customer never gets locked out of what they bought.
  const sourcePath = libraryItem.instance_path ?? product.file_path;
  const signedUrl = await createProductFileSignedUrl(sourcePath, 120);
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
  const lowerSourcePath = sourcePath.toLowerCase();
  const isZip = lowerSourcePath.endsWith(".zip");
  const isPdf =
    upstreamType.startsWith("application/pdf") || lowerSourcePath.endsWith(".pdf");

  if (isPdf && upstream.body) {
    const filename = getSafeInlinePdfName(product.name ?? "Templify ebook");
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set(
      "Content-Disposition",
      `inline; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Referrer-Policy", "no-referrer");

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(upstream.body, {
      status: 200,
      headers,
    });
  }

  let html: string | null = null;

  if (isZip) {
    const buffer = Buffer.from(await upstream.arrayBuffer());
    const extracted = await extractFirstHtmlFromZip(buffer).catch(() => null);
    html = extracted?.html ?? null;
  } else if (
    upstreamType.startsWith("text/html") ||
    lowerSourcePath.endsWith(".html") ||
    lowerSourcePath.endsWith(".htm")
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

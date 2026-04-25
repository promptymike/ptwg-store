import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { createProductFileSignedUrl } from "@/lib/supabase/storage";

type DownloadRouteProps = {
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

function getSafeDownloadName(productName: string, storagePath: string) {
  const extension = storagePath.includes(".")
    ? storagePath.split(".").pop()?.toLowerCase()
    : null;
  const normalizedBaseName = productName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  const baseName = normalizedBaseName || "templify-produkt";

  return extension ? `${baseName}.${extension}` : baseName;
}

export async function GET(request: Request, { params }: DownloadRouteProps) {
  const { productId } = await params;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Brak konfiguracji Supabase dla pobierania plikow.",
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      buildAppUrl(request, `/logowanie?next=${encodeURIComponent("/biblioteka")}`),
    );
  }

  const { data, error } = await supabase
    .from("library_items")
    .select("id, download_count, product_id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (error || !data) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Nie masz dostepu do tego produktu w bibliotece.",
    );
  }

  const adminSupabase = createSupabaseAdminClient();

  if (!adminSupabase) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Brak konfiguracji Supabase dla pobierania plikow.",
    );
  }

  const { data: product, error: productError } = await adminSupabase
    .from("products")
    .select("name, file_path")
    .eq("id", data.product_id)
    .maybeSingle();

  if (productError || !product) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Nie udalo sie odnalezc produktu do pobrania.",
    );
  }

  if (!product.file_path) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Plik dla tego produktu nie zostal jeszcze dodany.",
    );
  }

  const signedUrl = await createProductFileSignedUrl(product.file_path, 120);

  if (!signedUrl) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Nie udalo sie wygenerowac bezpiecznego linku do pobrania.",
    );
  }

  const upstream = await fetch(signedUrl, { cache: "no-store" });

  if (!upstream.ok || !upstream.body) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Nie udalo sie pobrac pliku. Sprobuj ponownie za chwile.",
    );
  }

  await adminSupabase
    .from("library_items")
    .update({
      download_count: data.download_count + 1,
      last_downloaded_at: new Date().toISOString(),
    })
    .eq("id", data.id)
    .eq("user_id", user.id);

  const filename = getSafeDownloadName(product.name, product.file_path);
  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("content-type") ?? "application/octet-stream",
  );
  headers.set(
    "Content-Disposition",
    `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );
  headers.set("Cache-Control", "private, no-store");

  const contentLength = upstream.headers.get("content-length");

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new Response(upstream.body, {
    status: 200,
    headers,
  });
}

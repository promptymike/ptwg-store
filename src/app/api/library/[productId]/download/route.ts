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

export async function GET(request: Request, { params }: DownloadRouteProps) {
  const { productId } = await params;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Brak konfiguracji Supabase dla pobierania plików.",
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
    .select("id, download_count, products!inner(name, file_path)")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (error || !data) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Nie masz dostępu do tego produktu w bibliotece.",
    );
  }

  if (!data.products.file_path) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Plik dla tego produktu nie został jeszcze dodany.",
    );
  }

  const signedUrl = await createProductFileSignedUrl(data.products.file_path);

  if (!signedUrl) {
    return redirectWithMessage(
      request,
      "/biblioteka",
      "error",
      "Nie udało się wygenerować bezpiecznego linku do pobrania.",
    );
  }

  const adminSupabase = createSupabaseAdminClient();

  if (adminSupabase) {
    await adminSupabase
      .from("library_items")
      .update({
        download_count: data.download_count + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("user_id", user.id);
  }

  return NextResponse.redirect(signedUrl);
}

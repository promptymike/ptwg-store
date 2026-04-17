import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createProductFileSignedUrl } from "@/lib/supabase/storage";

type DownloadRouteProps = {
  params: Promise<{
    productId: string;
  }>;
};

export async function GET(request: Request, { params }: DownloadRouteProps) {
  const { productId } = await params;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { message: "Brak konfiguracji Supabase." },
      { status: 500 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/logowanie", env.appUrl || request.url));
  }

  const { data, error } = await supabase
    .from("library_items")
    .select("products!inner(file_path)")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (error || !data?.products?.file_path) {
    return NextResponse.json(
      { message: "Nie znaleziono pliku dla tego produktu." },
      { status: 404 },
    );
  }

  const signedUrl = await createProductFileSignedUrl(data.products.file_path);

  if (!signedUrl) {
    return NextResponse.json(
      { message: "Nie udało się wygenerować signed URL." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(signedUrl);
}

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Route handler dla linków z maili Supabase (potwierdzenie rejestracji, magic
 * link, reset hasła).
 *
 * Supabase dokleja do URL parametr `code` (PKCE) — wymieniamy go tutaj na
 * sesję, zapisujemy cookies (`sb-*`) i dopiero wtedy przenosimy użytkownika
 * na stronę docelową. Bez tego route'a link z maila nie mógł ustawić sesji
 * i użytkownik lądował na goły adres aplikacji jako niezalogowany.
 *
 * Uwaga: cookies muszą być zapisywane przez response (`response.cookies.set`),
 * bo w route handlerze nie możemy zmutować `next/headers` cookies tak, żeby
 * przeżyły do odpowiedzi — używamy `NextResponse.redirect` i mutujemy jego
 * cookie jar.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/konto";
  const errorDescription = url.searchParams.get("error_description");

  const safeNext = nextParam.startsWith("/") ? nextParam : "/konto";

  if (errorDescription) {
    const failure = new URL("/logowanie", url.origin);
    failure.searchParams.set("auth_error", errorDescription);
    return NextResponse.redirect(failure);
  }

  if (!code) {
    // Niektóre starsze linki Supabase używają hash fragment ('#access_token=...')
    // — takich nie zobaczymy po stronie serwera, więc po prostu odsyłamy na
    // stronę logowania.
    return NextResponse.redirect(new URL(safeNext, url.origin));
  }

  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    return NextResponse.redirect(new URL("/logowanie", url.origin));
  }

  const response = NextResponse.redirect(new URL(safeNext, url.origin));

  const supabase = createServerClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set({ name, value, ...options });
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const failure = new URL("/logowanie", url.origin);
    failure.searchParams.set("auth_error", error.message);
    return NextResponse.redirect(failure);
  }

  return response;
}

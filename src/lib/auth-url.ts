import { env } from "@/lib/env";

/**
 * Zwraca bazowy origin aplikacji używany w linkach e-mail z Supabase (potwierdzenie
 * rejestracji, magic link, reset hasła).
 *
 * Kolejność preferencji:
 * 1. `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL` — jeśli ustawione, używamy
 *    stabilnego, przewidywalnego originu. To właśnie ten origin MUSI być dodany
 *    do allowlisty w `Authentication → URL Configuration → Redirect URLs`
 *    w dashboardzie Supabase.
 * 2. `window.location.origin` — fallback, gdy zmienna środowiskowa nie jest
 *    ustawiona (np. preview deploy).
 * 3. `http://localhost:3000` — ostatnia deska ratunku dla dev środowiska bez
 *    konfiguracji.
 */
export function getAppOrigin(): string {
  const envUrl = env.siteUrl?.trim();

  if (envUrl && envUrl !== "http://localhost:3000") {
    return stripTrailingSlash(envUrl);
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return stripTrailingSlash(window.location.origin);
  }

  return envUrl ? stripTrailingSlash(envUrl) : "http://localhost:3000";
}

/**
 * URL, na który Supabase odeśle użytkownika po kliknięciu linku z maila
 * (potwierdzenie konta, reset hasła, magic link). Wskazuje na nasz własny
 * route handler `/auth/callback`, który wymienia kod PKCE na sesję i dopiero
 * potem przenosi do `nextPath`.
 *
 * WAŻNE: ten URL musi być wpisany na allowliście w Supabase — inaczej backend
 * Supabase zignoruje parametr `redirect_to` i użyje globalnego Site URL, co
 * jest dokładnie tą ścieżką, którą teraz naprawiamy (redirect na localhost).
 */
export function getAuthCallbackUrl(nextPath = "/konto"): string {
  const origin = getAppOrigin();
  const normalizedNext = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", normalizedNext);
  return callback.toString();
}

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

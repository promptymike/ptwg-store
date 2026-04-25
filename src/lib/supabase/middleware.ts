import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env, hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.endsWith("-auth-token"));
}

function buildLoginRedirect(request: NextRequest, response: NextResponse) {
  const loginUrl = new URL("/logowanie", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  const redirectResponse = NextResponse.redirect(loginUrl);
  copyCookies(response, redirectResponse);
  return redirectResponse;
}

export async function updateSupabaseSession(request: NextRequest) {
  if (!hasSupabaseEnv() || !env.supabaseUrl || !env.supabasePublishableKey) {
    return NextResponse.next({ request });
  }

  const pathname = request.nextUrl.pathname;
  const requiresAdmin = pathname.startsWith("/admin");
  const requiresUser =
    pathname.startsWith("/konto") || pathname.startsWith("/biblioteka");
  const requiresAuth = requiresAdmin || requiresUser;

  let response = NextResponse.next({ request });

  if (requiresAuth && !hasSupabaseAuthCookie(request)) {
    return buildLoginRedirect(request, response);
  }

  const supabase = createServerClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!requiresAuth) {
    return response;
  }

  if (!user) {
    return buildLoginRedirect(request, response);
  }

  if (!requiresAdmin) {
    return response;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    const accountUrl = new URL("/konto", request.url);
    accountUrl.searchParams.set("denied", "admin");
    const redirectResponse = NextResponse.redirect(accountUrl);
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  return response;
}

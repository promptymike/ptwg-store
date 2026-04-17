import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env, hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

export async function updateSupabaseSession(request: NextRequest) {
  if (!hasSupabaseEnv() || !env.supabaseUrl || !env.supabasePublishableKey) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

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

  const pathname = request.nextUrl.pathname;
  const requiresAdmin = pathname.startsWith("/admin");
  const requiresUser =
    pathname.startsWith("/konto") || pathname.startsWith("/biblioteka");

  if (!requiresAdmin && !requiresUser) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/logowanie", request.url);
    loginUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    copyCookies(response, redirectResponse);
    return redirectResponse;
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

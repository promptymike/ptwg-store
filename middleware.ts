import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/session";

export function middleware(request: NextRequest) {
  const role = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;

  const requiresAdmin = pathname.startsWith("/admin");
  const requiresUser = pathname.startsWith("/konto") || pathname.startsWith("/biblioteka");

  if (!requiresAdmin && !requiresUser) {
    return NextResponse.next();
  }

  if (!role) {
    const loginUrl = new URL("/logowanie", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (requiresAdmin && role !== "admin") {
    const accountUrl = new URL("/konto", request.url);
    accountUrl.searchParams.set("denied", "admin");
    return NextResponse.redirect(accountUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/konto/:path*", "/biblioteka/:path*", "/admin/:path*"],
};

import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/konto",
    "/konto/:path*",
    "/biblioteka",
    "/biblioteka/:path*",
    "/admin",
    "/admin/:path*",
  ],
};

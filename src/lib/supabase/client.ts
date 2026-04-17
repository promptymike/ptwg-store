"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env } from "@/lib/env";
import type { Database } from "@/types/database.types";

export function createSupabaseBrowserClient() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    return null;
  }

  return createBrowserClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
  );
}

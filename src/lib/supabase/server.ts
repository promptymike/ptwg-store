import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";
import type { Database } from "@/types/database.types";

export async function createSupabaseServerClient() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always write cookies. In those cases
            // the middleware keeps the session fresh; Route Handlers can set
            // refreshed auth cookies here.
          }
        },
      },
    },
  );
}

let adminClient: ReturnType<typeof createClient<Database>> | null | undefined;

export function createSupabaseAdminClient() {
  if (!env.supabaseUrl || !env.supabaseSecretKey) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient<Database>(
      env.supabaseUrl,
      env.supabaseSecretKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return adminClient;
}

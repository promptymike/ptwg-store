import { cookies } from "next/headers";

import type { UserRole } from "@/types/store";

export const SESSION_COOKIE_NAME = "ptwg_role";

export async function getCurrentRole(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (role === "admin" || role === "user") {
    return role;
  }

  return null;
}

export function isAdminRole(role: string | null | undefined): role is UserRole {
  return role === "admin" || role === "user";
}

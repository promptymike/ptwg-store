import type { ReactNode } from "react";

import { PromoStrip } from "@/components/layout/promo-strip";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentProfile } from "@/lib/session";

function deriveInitials(input: string | null | undefined) {
  if (!input) return "T";
  const cleaned = input.trim();
  if (!cleaned) return "T";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();
  const profileSummary = profile
    ? {
        initials: deriveInitials(profile.full_name ?? profile.email),
        displayName:
          profile.full_name?.trim() || profile.email?.split("@")[0] || "Konto",
        email: profile.email ?? "",
        isAdmin: profile.role === "admin",
      }
    : null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <PromoStrip />
      <SiteHeader profile={profileSummary} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

import type { ReactNode } from "react";

import { AffiliateCapture } from "@/components/analytics/affiliate-capture";
import { CampaignAttributionCapture } from "@/components/analytics/campaign-attribution-capture";
import { PageTransition } from "@/components/layout/page-transition";
import { PromoStrip } from "@/components/layout/promo-strip";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { StoreOnboardingTour } from "@/components/onboarding/store-onboarding-tour";
import { WishlistSync } from "@/components/products/wishlist-sync";
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
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
      {/* Store tour fires on the first visit for any logged-in shopper.
          Skipped for anonymous browsers — they get the slim cookie banner
          instead and see the product cards work without a modal. */}
      {profileSummary ? <StoreOnboardingTour /> : null}
      {profileSummary ? <WishlistSync /> : null}
      <AffiliateCapture />
      <CampaignAttributionCapture />
    </div>
  );
}

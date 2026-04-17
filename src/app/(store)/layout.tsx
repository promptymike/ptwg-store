import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentProfile } from "@/lib/session";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader isAuthenticated={Boolean(profile)} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

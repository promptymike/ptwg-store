import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { AdminOnboardingTour } from "@/components/onboarding/admin-onboarding-tour";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentProfile, getCurrentUser } from "@/lib/session";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produkty", label: "Produkty" },
  { href: "/admin/pakiety", label: "Pakiety" },
  { href: "/admin/import", label: "Import / Źródła produktów" },
  { href: "/admin/kategorie", label: "Kategorie" },
  { href: "/admin/zamowienia", label: "Zamówienia" },
  { href: "/admin/recenzje", label: "Recenzje" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/content", label: "Content / Strony" },
  { href: "/admin/admini", label: "Użytkownicy / Admini" },
  { href: "/admin/ustawienia", label: "Ustawienia" },
];

export const metadata: Metadata = {
  title: {
    default: "Admin | Templify",
    template: "%s | Admin | Templify",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/logowanie?next=/admin");
  }

  const profile = await getCurrentProfile();

  if (profile?.role !== "admin") {
    redirect("/konto?denied=admin");
  }

  return (
    <div className="shell section-space space-y-8">
      <div className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">Templify Admin</span>
            <div>
              <h1 className="text-4xl text-foreground sm:text-5xl">CMS-lite dla operacji i treści</h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Zalogowany administrator: {profile?.full_name ?? profile?.email ?? "brak profilu"}.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="rounded-full border border-border/70 px-4 py-2 text-sm text-foreground transition hover:border-primary/30"
            >
              Wróć do sklepu
            </Link>
            <LogoutButton />
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {children}

      <AdminOnboardingTour />
    </div>
  );
}

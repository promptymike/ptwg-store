import type { ReactNode } from "react";
import Link from "next/link";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/produkty", label: "Produkty" },
  { href: "/admin/zamowienia", label: "Zamówienia" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="shell section-space space-y-8">
      <div className="surface-panel gold-frame flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="eyebrow">PTWG Admin</span>
            <div>
              <h1 className="text-4xl text-white sm:text-5xl">Panel administracyjny</h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Placeholder gotowy pod Supabase Auth, role i przyszłe operacje CRUD.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-primary transition hover:text-primary/80"
          >
            Wróć do sklepu
          </Link>
        </div>

        <nav className="flex flex-wrap gap-2">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-border/80 bg-secondary/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/35 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {children}
    </div>
  );
}

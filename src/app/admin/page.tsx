import Link from "next/link";

import { getAdminDashboardSnapshot } from "@/lib/supabase/store";

export default async function AdminDashboardPage() {
  const snapshot = await getAdminDashboardSnapshot();
  const cards = [
    {
      label: "Produkty",
      value: String(snapshot.productCount),
      detail: `${snapshot.publishedCount} opublikowanych`,
    },
    {
      label: "Zamówienia",
      value: String(snapshot.orderCount),
      detail: "realne rekordy po Stripe Checkout",
    },
    {
      label: "Przychód",
      value: snapshot.revenue,
      detail: "suma z tabeli orders",
    },
    {
      label: "Strony",
      value: String(snapshot.contentCount),
      detail: "content pages i sekcje legal",
    },
    {
      label: "Admini",
      value: String(snapshot.adminCount),
      detail: "aktywne wpisy allowlisty",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article key={card.label} className="surface-panel p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
              {card.label}
            </p>
            <p className="mt-3 text-3xl text-foreground">{card.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-panel space-y-4 p-6">
          <h2 className="text-2xl text-foreground">Szybkie akcje</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/produkty"
              className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Dodaj produkt, pricing i pliki
            </Link>
            <Link
              href="/admin/kategorie"
              className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Uporządkuj kategorię i kolejność
            </Link>
            <Link
              href="/admin/content"
              className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Edytuj hero, FAQ, testimonials i legal
            </Link>
            <Link
              href="/admin/admini"
              className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Zarządzaj allowlistą adminów
            </Link>
          </div>
        </section>

        <section className="surface-panel space-y-4 p-6">
          <h2 className="text-2xl text-foreground">Stan operacyjny</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Storefront korzysta z light editorial premium jako trybu domyślnego.</li>
            <li>Theme toggle działa w `light`, `dark` i `system` bez zmiany istniejącej architektury auth/Stripe.</li>
            <li>Legal pages, FAQ i testimonials są trzymane w Supabase i mogą być edytowane z panelu.</li>
            <li>Allowlista adminów nadaje rolę `admin` automatycznie po logowaniu lub rejestracji.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

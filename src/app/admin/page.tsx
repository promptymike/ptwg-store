import Link from "next/link";

import { getAdminDashboardSnapshot } from "@/lib/supabase/store";

export default async function AdminDashboardPage() {
  const snapshot = await getAdminDashboardSnapshot();
  const cards = [
    {
      label: "Draft",
      value: String(snapshot.draftCount),
      detail: "produkty niewidoczne jeszcze w sklepie",
    },
    {
      label: "Gotowe do publikacji",
      value: String(snapshot.readyToPublishCount),
      detail: "pipeline ustawiony na ready",
    },
    {
      label: "Opublikowane",
      value: String(snapshot.publishedCount),
      detail: "produkty aktywne na storefront",
    },
    {
      label: "Niepodpięte pliki",
      value: String(snapshot.unattachedSourceCount),
      detail: "materiały czekające w imporcie",
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
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-panel space-y-4 p-6">
          <h2 className="text-2xl text-foreground">Szybkie akcje</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/import"
              className="rounded-[1.2rem] border border-primary/20 bg-primary/10 px-4 py-4 text-sm text-foreground transition hover:border-primary/30"
            >
              Przejrzyj źródła produktów i utwórz drafty
            </Link>
            <Link
              href="/admin/produkty"
              className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Zarządzaj pricingiem, plikami i publikacją
            </Link>
            <Link
              href="/admin/kategorie"
              className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Uporządkuj kategorie i kolejność katalogu
            </Link>
            <Link
              href="/admin/zamowienia"
              className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Sprawdź zamówienia i fulfillment
            </Link>
          </div>
        </section>

        <section className="surface-panel space-y-4 p-6">
          <h2 className="text-2xl text-foreground">Stan operacyjny</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Import łączy realne pliki robocze z produktami w sklepie.</li>
            <li>Pipeline rozdziela pracę redakcyjną od statusu publikacji na storefront.</li>
            <li>Produkty publikowane dalej korzystają z istniejącego auth, storage i Stripe.</li>
            <li>Allowlista adminów i RLS nadal chronią mutacje po stronie panelu.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

import Link from "next/link";

import { getAdminDashboardSnapshot } from "@/lib/supabase/store";

export default async function AdminDashboardPage() {
  const snapshot = await getAdminDashboardSnapshot();
  const cards = [
    {
      label: "Produkty",
      value: String(snapshot.productCount),
      detail: "rekordów dostępnych w katalogu Supabase",
    },
    {
      label: "Zamówienia",
      value: String(snapshot.orderCount),
      detail: "widoczne przez realne zapytania i role",
    },
    {
      label: "Przychód",
      value: snapshot.revenue,
      detail: "suma z tabeli orders",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="surface-panel gold-frame p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
              {card.label}
            </p>
            <p className="mt-3 text-4xl text-white">{card.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="surface-panel gold-frame space-y-4 p-6">
          <h2 className="text-2xl text-white">Szybkie akcje</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/admin/kategorie"
              className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-4 text-sm text-muted-foreground transition hover:text-white"
            >
              Zarządzaj kategoriami
            </Link>
            <Link
              href="/admin/produkty"
              className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-4 text-sm text-muted-foreground transition hover:text-white"
            >
              Zarządzaj produktami
            </Link>
            <Link
              href="/admin/zamowienia"
              className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-4 text-sm text-muted-foreground transition hover:text-white"
            >
              Zobacz zamówienia
            </Link>
          </div>
        </section>

        <section className="surface-panel gold-frame space-y-4 p-6">
          <h2 className="text-2xl text-white">Stan integracji</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Supabase Auth: aktywne logowanie, rejestracja i wylogowanie.</li>
            <li>Middleware i role: ochrona tras dla konta, biblioteki i admina.</li>
            <li>Admin: realny CRUD kategorii i produktów z uploadem do Storage.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

import Link from "next/link";

import { getAdminDashboardSnapshot } from "@/lib/supabase/store";

export default async function AdminDashboardPage() {
  const snapshot = await getAdminDashboardSnapshot();
  const cards = [
    {
      label: "Produkty",
      value: String(snapshot.productCount),
      detail: "rekordów pobranych z Supabase",
    },
    {
      label: "Zamówienia",
      value: String(snapshot.orderCount),
      detail: "widoczne przez realne zapytania RLS",
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
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/admin/produkty"
              className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-4 text-sm text-muted-foreground transition hover:text-white"
            >
              Dodaj nowy produkt
            </Link>
            <Link
              href="/admin/zamowienia"
              className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-4 text-sm text-muted-foreground transition hover:text-white"
            >
              Zobacz listę zamówień
            </Link>
          </div>
        </section>

        <section className="surface-panel gold-frame space-y-4 p-6">
          <h2 className="text-2xl text-white">Stan integracji</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Supabase Auth: aktywne logowanie, rejestracja i wylogowanie.</li>
            <li>Middleware: ochrona tras oparta o prawdziwe auth cookies.</li>
            <li>Admin: dane czytane bezpośrednio z tabel products i orders.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

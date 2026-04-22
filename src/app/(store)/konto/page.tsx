import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountQuickLinks } from "@/components/account/account-quick-links";
import { LogoutButton } from "@/components/auth/logout-button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatOrderStatus } from "@/lib/format";
import { getCurrentProfile, getCurrentUser } from "@/lib/session";
import { getAccountSnapshot } from "@/lib/supabase/store";

export const metadata: Metadata = {
  title: "Konto | Templify",
  robots: {
    index: false,
    follow: false,
  },
};

type AccountPageProps = {
  searchParams: Promise<{
    denied?: string;
  }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const user = await getCurrentUser();
  const resolvedSearchParams = await searchParams;

  if (!user) {
    redirect("/logowanie");
  }

  const [profile, snapshot] = await Promise.all([
    getCurrentProfile(),
    getAccountSnapshot(user.id),
  ]);

  if (!profile || !snapshot) {
    return (
      <div className="shell section-space">
        <EmptyState
          badge="Konto użytkownika"
          title="Nie udało się pobrać profilu"
          description="Nie udało się wczytać Twojego profilu. Odśwież stronę lub zaloguj się ponownie. Jeśli problem wróci, napisz do nas na kontakt@templify.store."
          action={{ href: "/produkty", label: "Wróć do sklepu" }}
        />
      </div>
    );
  }

  return (
    <div className="shell section-space space-y-6">
      <section id="profil" className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">Konto</span>
            <div>
              <h1 className="text-4xl text-foreground sm:text-5xl">
                {profile.full_name ?? "Twoje konto"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Tutaj znajdziesz bibliotekę produktów, historię zamówień i podstawowe informacje o
                koncie. To jest Twoje główne miejsce po zakupie.
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">E-mail</p>
            <p className="mt-3 text-lg text-foreground">{profile.email}</p>
          </article>
          <article className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Rola</p>
            <p className="mt-3 text-lg text-foreground">{profile.role}</p>
          </article>
          <article className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Biblioteka</p>
            <p className="mt-3 text-lg text-foreground">{snapshot.libraryCount} pozycji</p>
          </article>
        </div>

        <AccountQuickLinks
          libraryCount={snapshot.libraryCount}
          orderCount={snapshot.orders.length}
          email={profile.email}
        />

        {resolvedSearchParams.denied ? (
          <div className="rounded-[1.4rem] border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
            To konto nie ma uprawnień administracyjnych. Jeśli uważasz, że to pomyłka, napisz do
            nas na kontakt@templify.store.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/biblioteka"
            className="rounded-full border border-primary/30 bg-primary/12 px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-primary/18"
          >
            Przejdź do biblioteki
          </Link>
          {profile.role === "admin" ? (
            <Link
              href="/admin"
              className="rounded-full border border-border/70 bg-background/60 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30"
            >
              Otwórz panel admina
            </Link>
          ) : null}
        </div>
      </section>

      <section id="zamowienia" className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Ostatnie zamówienia</h2>
          <p className="text-sm text-muted-foreground">
            Każde zakończone zamówienie pojawia się tutaj automatycznie razem z historią płatności
            i dostępem do produktów w bibliotece.
          </p>
        </div>

        {snapshot.orders.length === 0 ? (
          <EmptyState
            badge="Brak zamówień"
            title="Nie masz jeszcze żadnych zamówień"
            description="Po pierwszym zakupie historia zamówień pojawi się tutaj, a pliki trafią prosto do Twojej biblioteki."
            action={{ href: "/produkty", label: "Przeglądaj katalog" }}
          />
        ) : (
          <div className="grid gap-3">
            {snapshot.orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[1.4rem] border border-border/70 bg-background/60 px-4 py-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-foreground">{formatCurrency(order.total)}</p>
                    <p className="text-primary">{formatOrderStatus(order.status)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

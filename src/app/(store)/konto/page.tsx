import { redirect } from "next/navigation";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatOrderStatus } from "@/lib/format";
import { getCurrentProfile, getCurrentUser } from "@/lib/session";
import { getAccountSnapshot } from "@/lib/supabase/store";

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
          description="Sprawdź migracje Supabase i tabelę profiles. Widok konta wymaga aktywnego profilu powiązanego z auth.users."
          action={{ href: "/produkty", label: "Wróć do sklepu" }}
        />
      </div>
    );
  }

  return (
    <div className="shell section-space space-y-6">
      <section className="surface-panel gold-frame space-y-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">Konto użytkownika</span>
            <div>
              <h1 className="text-4xl text-white sm:text-5xl">
                {profile.full_name ?? "Twoje konto"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Profil jest pobierany z tabeli `profiles` i połączony z Supabase Auth.
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
              E-mail
            </p>
            <p className="mt-3 text-lg text-white">{profile.email}</p>
          </article>
          <article className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
              Rola
            </p>
            <p className="mt-3 text-lg text-white">{profile.role}</p>
          </article>
          <article className="rounded-[1.5rem] border border-border/70 bg-secondary/45 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
              Biblioteka
            </p>
            <p className="mt-3 text-lg text-white">{snapshot.libraryCount} pozycji</p>
          </article>
        </div>

        {resolvedSearchParams.denied ? (
          <div className="rounded-[1.4rem] border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
            Brak uprawnień do panelu admina dla roli `{profile.role}`. Jeśli chcesz
            wejść do panelu, ustaw rolę `admin` w tabeli `profiles`.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/biblioteka"
            className="rounded-full border border-primary/30 bg-primary/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/18"
          >
            Przejdź do biblioteki
          </Link>
          {profile.role === "admin" ? (
            <Link
              href="/admin"
              className="rounded-full border border-border/70 bg-secondary/50 px-5 py-3 text-sm font-semibold text-white transition hover:border-primary/30"
            >
              Otwórz panel admina
            </Link>
          ) : null}
        </div>
      </section>

      <section className="surface-panel gold-frame space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-white">Ostatnie zamówienia</h2>
          <p className="text-sm text-muted-foreground">
            To pierwsze miejsce, w którym widać już prawdziwe rekordy z tabeli `orders`.
          </p>
        </div>

        {snapshot.orders.length === 0 ? (
          <EmptyState
            badge="Brak zamówień"
            title="Nie masz jeszcze żadnych zamówień"
            description="Po pierwszym udanym zakupie Stripe historia zamówień pojawi się tutaj automatycznie."
            action={{ href: "/produkty", label: "Przeglądaj katalog" }}
          />
        ) : (
          <div className="grid gap-3">
            {snapshot.orders.map((order) => (
              <article
                key={order.id}
                className="rounded-[1.4rem] border border-border/70 bg-secondary/45 px-4 py-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg text-white">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-white">{formatCurrency(order.total)}</p>
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

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, LibraryBig } from "lucide-react";

import { LibraryGrid } from "@/components/account/library-grid";
import { ReadingStreakBadge } from "@/components/account/reading-streak-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";
import { getCustomerLibrarySnapshot } from "@/lib/supabase/store";

export const metadata: Metadata = {
  title: "Biblioteka",
  robots: {
    index: false,
    follow: false,
  },
};

type LibraryPageProps = {
  searchParams: Promise<{
    type?: string;
    message?: string;
  }>;
};

function LibraryNotice({
  type,
  message,
}: {
  type?: string;
  message?: string;
}) {
  if (!type || !message) {
    return null;
  }

  const isSuccess = type === "success";

  return (
    <div
      className={`rounded-[1.4rem] border p-4 text-sm ${
        isSuccess
          ? "border-primary/20 bg-primary/10 text-muted-foreground"
          : "border-destructive/30 bg-destructive/10 text-foreground"
      }`}
    >
      {message}
    </div>
  );
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const [user, status] = await Promise.all([getCurrentUser(), searchParams]);

  if (!user) {
    redirect("/logowanie?next=/biblioteka");
  }

  const snapshot = await getCustomerLibrarySnapshot(user.id);

  if (snapshot.error) {
    return (
      <div className="shell section-space space-y-6">
        <LibraryNotice type={status.type} message={status.message} />
        <EmptyState
          icon={LibraryBig}
          badge="Moja biblioteka"
          title="Nie udało się wczytać biblioteki"
          description="Nie mogliśmy pobrać Twoich zakupionych produktów. Odśwież stronę lub spróbuj ponownie za chwilę."
          action={{ href: "/produkty", label: "Przejdź do katalogu" }}
          secondaryAction={{ href: "/kontakt", label: "Napisz do nas" }}
        />
      </div>
    );
  }

  if (snapshot.items.length === 0) {
    return (
      <div className="shell section-space space-y-6">
        <LibraryNotice type={status.type} message={status.message} />
        <EmptyState
          icon={LibraryBig}
          badge="Moja biblioteka"
          title="Twoja biblioteka czeka na pierwszy ebook"
          description="Po pierwszym zakupie produkty pojawią się tu automatycznie wraz z bezpiecznym linkiem do czytania w przeglądarce i szybkim pobraniem PDF."
          action={{ href: "/produkty", label: "Wybierz pierwszy ebook" }}
          secondaryAction={{ href: "/test", label: "Zrób test dopasowania" }}
        />
      </div>
    );
  }

  return (
    <div className="shell section-space space-y-6">
      <LibraryNotice type={status.type} message={status.message} />

      <section className="surface-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="eyebrow">Moja biblioteka</span>
            <div>
              <h1 className="text-4xl text-foreground sm:text-5xl">Twoje zakupione produkty</h1>
              <p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
                Wszystkie kupione pliki, aktualizacje i szybki powrót do kart produktów masz w
                jednym miejscu. Tylko zalogowane konto z zakupem widzi te materiały.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:max-w-md">
            <div className="rounded-[1.4rem] border border-border/70 bg-background/60 px-5 py-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">Pozycje</p>
              <p className="mt-3 text-2xl text-foreground">{snapshot.items.length}</p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-background/60 px-5 py-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                Gotowe do pobrania
              </p>
              <p className="mt-3 text-2xl text-foreground">
                {snapshot.items.filter((item) => item.filePath).length}
              </p>
            </div>
            <div className="sm:col-span-2">
              <ReadingStreakBadge />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
            <LibraryBig className="mr-2 size-3.5" />
            Konto chroni dostęp do Twoich plików
          </Badge>
          <Badge variant="outline" className="border-border/70 bg-background/60 text-foreground">
            <Download className="mr-2 size-3.5" />
            Pobranie działa tylko dla zakupionych produktów
          </Badge>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" render={<Link href="/konto" />}>
          Wróć do konta
        </Button>
        <Button variant="outline" render={<Link href="/produkty" />}>
          Przeglądaj katalog
        </Button>
      </div>

      <LibraryGrid items={snapshot.items} />
    </div>
  );
}

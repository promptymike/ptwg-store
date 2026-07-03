import Link from "next/link";
import { Lock, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  PURCHASES_ENABLED,
  PURCHASES_UNAVAILABLE_MESSAGE,
  PURCHASES_UNAVAILABLE_TITLE,
} from "@/lib/purchase-availability";

export function CheckoutAuthGate() {
  if (!PURCHASES_ENABLED) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="surface-panel space-y-6 p-6 sm:p-8">
          <div className="space-y-3">
            <span className="eyebrow">Tryb testowy</span>
            <div>
              <h1 className="text-4xl text-foreground sm:text-5xl">
                {PURCHASES_UNAVAILABLE_TITLE}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                {PURCHASES_UNAVAILABLE_MESSAGE}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
              <Lock className="mb-3 size-5 text-primary" />
              Dostęp testowy działa przez konta beta i bibliotekę użytkownika.
            </article>
            <article className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
              <Sparkles className="mb-3 size-5 text-primary" />
              Możesz normalnie oglądać produkty, demo planerów i zrobić test dopasowania.
            </article>
            <article className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="mb-3 size-5 text-primary" />
              Płatności wrócą po zakończeniu rundy testów i ostatnich poprawek.
            </article>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/produkty" />}>
              Przeglądaj e-booki
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/planery" />}>
              Zobacz planery
            </Button>
          </div>
        </section>

        <aside className="surface-panel h-fit space-y-4 p-6">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
            Co dalej?
          </p>
          <h2 className="text-2xl text-foreground">
            Chcesz dobrać produkt bez kupowania?
          </h2>
          <p className="text-sm leading-7 text-muted-foreground">
            Do czasu otwarcia sprzedaży możesz sprawdzić katalog, odpalić demo
            planerów albo przejść krótki test dopasowania.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="outline" render={<Link href="/test" />}>
              Zrób test dopasowania
            </Button>
            <Button variant="ghost" render={<Link href="/koszyk" />}>
              Wróć do koszyka
            </Button>
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <span className="eyebrow">Jeszcze jeden krok</span>
          <div>
            <h1 className="text-4xl text-foreground sm:text-5xl">Dokończ zakup po zalogowaniu</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Konto jest potrzebne tylko po to, żeby bezpiecznie przypisać zakup do Twojej
              biblioteki i dać Ci natychmiastowy dostęp do plików po płatności.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
            <Lock className="mb-3 size-5 text-primary" />
            Jedno konto porządkuje wszystkie zakupy i pobrania w jednym miejscu.
          </article>
          <article className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
            <Sparkles className="mb-3 size-5 text-primary" />
            Po płatności pliki pojawią się automatycznie w bibliotece bez ręcznej obsługi.
          </article>
          <article className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
            <ShieldCheck className="mb-3 size-5 text-primary" />
            Zajmuje to chwilę i nie zmienia nic w samym koszyku ani w płatności.
          </article>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/logowanie?next=/checkout" />}>
            Zaloguj się i przejdź dalej
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/rejestracja?next=/checkout" />}>
            Załóż konto
          </Button>
        </div>
      </section>

      <aside className="surface-panel h-fit space-y-4 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Dlaczego to potrzebne</p>
        <h2 className="text-2xl text-foreground">Kupujesz raz, wracasz kiedy chcesz</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          Templify sprzedaje produkty cyfrowe z dostępem w bibliotece użytkownika. Dzięki temu nie
          musisz szukać maili ani linków do pobrania po kilku tygodniach.
        </p>
        <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
          Jeśli chcesz najpierw zobaczyć ofertę jeszcze raz, wróć do koszyka albo katalogu.
        </div>
        <div className="flex flex-col gap-3">
          <Button variant="outline" render={<Link href="/koszyk" />}>
            Wróć do koszyka
          </Button>
          <Button variant="ghost" render={<Link href="/produkty" />}>
            Przeglądaj katalog
          </Button>
        </div>
      </aside>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, Gift, ShieldCheck } from "lucide-react";

import { GiftPurchaseForm } from "@/components/gifts/gift-purchase-form";
import { Button } from "@/components/ui/button";
import { buildCanonicalMetadata } from "@/lib/seo";

export const metadata: Metadata = buildCanonicalMetadata({
  title: "Voucher podarunkowy",
  description:
    "Kup voucher Templify w wybranej kwocie. Po opłaceniu wysyłamy unikalny kod, który można wykorzystać na dowolny ebook lub pakiet ze sklepu.",
  path: "/podarunek",
});

export default function GiftPage() {
  return (
    <div className="shell section-space space-y-10">
      <section className="surface-panel overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-4">
            <span className="eyebrow inline-flex items-center gap-1.5">
              <Gift className="size-3.5" />
              Voucher podarunkowy
            </span>
            <h1 className="text-4xl text-foreground sm:text-5xl">
              Daj komuś prezent, który naprawdę się przydaje.
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Voucher kwotowy do wykorzystania na dowolny ebook lub pakiet ze sklepu
              Templify. Wysyłamy mailem, można wykorzystać do roku, jednorazowo przy
              jednym zamówieniu.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="outline" render={<Link href="/produkty" />}>
                Zobacz katalog
                <ArrowUpRight className="size-4" />
              </Button>
              <Button variant="ghost" render={<Link href="/kontakt" />}>
                Mam pytanie
              </Button>
            </div>
          </div>
          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="inline-flex items-center gap-2 text-foreground">
                <Clock className="size-4 text-primary" />
                Natychmiastowa dostawa
              </p>
              <p className="mt-1 text-xs">
                Kod trafia mailem zaraz po opłaceniu. Bez czekania na pocztę.
              </p>
            </li>
            <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="inline-flex items-center gap-2 text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                Ważny 12 miesięcy
              </p>
              <p className="mt-1 text-xs">
                Cała kwota lub jej część do wykorzystania w jednym zamówieniu.
              </p>
            </li>
            <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="inline-flex items-center gap-2 text-foreground">
                <Gift className="size-4 text-primary" />
                Dedykacja w mailu
              </p>
              <p className="mt-1 text-xs">
                Możesz dopisać krótką wiadomość, którą zobaczy obdarowana osoba.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-1">
          <h2 className="text-2xl text-foreground sm:text-3xl">
            Konfiguracja vouchera
          </h2>
          <p className="text-sm text-muted-foreground">
            Wybierz kwotę i powiedz, gdzie ma trafić kod. Po kliknięciu „Kup”
            przekierujemy do bezpiecznej płatności Stripe.
          </p>
        </div>
        <GiftPurchaseForm />
      </section>

      <section className="surface-panel space-y-3 p-6">
        <h2 className="text-xl text-foreground">Jak to działa</h2>
        <ol className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-primary/75">
              Krok 1
            </p>
            <p className="mt-2 text-foreground">Płatność</p>
            <p className="mt-1 text-xs">
              Wybierasz kwotę i opłacasz Stripe (BLIK / karta).
            </p>
          </li>
          <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-primary/75">
              Krok 2
            </p>
            <p className="mt-2 text-foreground">Kod mailem</p>
            <p className="mt-1 text-xs">
              Unikalny kod GIFT-XXXX trafia na wskazany adres w 1-2 minuty.
            </p>
          </li>
          <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-primary/75">
              Krok 3
            </p>
            <p className="mt-2 text-foreground">Wykorzystanie</p>
            <p className="mt-1 text-xs">
              Wpisujesz kod w polu „Mam kod” na ekranie checkoutu — kwota odejmuje
              się od zamówienia.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}

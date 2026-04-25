import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, Sparkles } from "lucide-react";

import { PartnerDashboard } from "@/components/partner/partner-dashboard";
import { Button } from "@/components/ui/button";
import { buildCanonicalMetadata } from "@/lib/seo";

export const metadata: Metadata = buildCanonicalMetadata({
  title: "Strefa partnera",
  description:
    "Sprawdź statystyki swojego kodu afiliacyjnego, śledź sprzedaż i prowizję — bez logowania, w trybie self-service.",
  path: "/partner",
});

export default function PartnerPage() {
  return (
    <div className="shell section-space space-y-10">
      <section className="surface-panel overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-4">
            <span className="eyebrow inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Program partnerski
            </span>
            <h1 className="text-4xl text-foreground sm:text-5xl">
              Twoja strefa partnera
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Każdy zakup zrobiony z linku <code>?ref=TWOJ_KOD</code> wpada na
              Twoje konto przez 30 dni od kliknięcia. Tu zobaczysz, ile osób
              kupiło i ile naliczyliśmy prowizji — wystarczy kod i e-mail, na
              który dostałaś/eś zaproszenie.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" render={<Link href="/produkty" />}>
                Otwórz katalog
                <ArrowUpRight className="size-4" />
              </Button>
              <Button variant="ghost" render={<Link href="/kontakt" />}>
                <Mail className="size-4" />
                Chcę dołączyć do programu
              </Button>
            </div>
          </div>

          <ul className="grid gap-3 text-sm text-muted-foreground">
            <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="text-foreground">Stała prowizja od każdego zakupu</p>
              <p className="mt-1 text-xs">
                Naliczamy ją od razu po opłaconym zamówieniu, niezależnie od
                liczby produktów w koszyku.
              </p>
            </li>
            <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="text-foreground">30 dni okna konwersji</p>
              <p className="mt-1 text-xs">
                Wystarczy jedno kliknięcie linku — kupujący ma miesiąc na
                zakup, prowizja nadal jest Twoja.
              </p>
            </li>
            <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="text-foreground">Wypłaty co miesiąc</p>
              <p className="mt-1 text-xs">
                Po przekroczeniu 100 zł prowizji rozliczamy się przelewem.
                Status każdego referrala widzisz tutaj na bieżąco.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <PartnerDashboard />

      <section className="surface-panel space-y-3 p-6">
        <h2 className="text-xl text-foreground">Krótka instrukcja</h2>
        <ol className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-primary/75">
              Krok 1
            </p>
            <p className="mt-2 text-foreground">Udostępnij swój link</p>
            <p className="mt-1 text-xs">
              Wystarczy doczepić <code>?ref=TWOJ_KOD</code> do dowolnej strony,
              np. <code>https://templify.pl/?ref=ANIA20</code>.
            </p>
          </li>
          <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-primary/75">
              Krok 2
            </p>
            <p className="mt-2 text-foreground">Kupujący wybiera ebook</p>
            <p className="mt-1 text-xs">
              Twój kod siedzi w przeglądarce 30 dni — działa nawet jeśli wróci
              później z innego urządzenia tego samego dnia.
            </p>
          </li>
          <li className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-primary/75">
              Krok 3
            </p>
            <p className="mt-2 text-foreground">My naliczamy prowizję</p>
            <p className="mt-1 text-xs">
              Po opłaceniu zamówienia widzisz je tu w ciągu kilku minut. Wszelkie
              pytania kierujemy na maila partnerów.
            </p>
          </li>
        </ol>
      </section>
    </div>
  );
}

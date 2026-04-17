import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="shell section-space relative overflow-hidden">
      <div className="surface-panel gold-frame relative overflow-hidden p-6 sm:p-8 lg:p-12">
        <div className="hero-orb -top-10 right-14 size-32 bg-primary/22" />
        <div className="hero-orb bottom-8 left-8 size-24 bg-white/8" />

        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="eyebrow">Digital luxury storefront</span>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl leading-none text-white sm:text-6xl lg:text-7xl">
                Sklep z cyfrowymi produktami, który sprzedaje klimatem i klarownością.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                PTWG.pl łączy premium dark-gold aesthetic z nowoczesnym UX. To
                gotowe MVP pod planery, e-booki, treningi, finanse i rozwój osobisty.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/produkty" />}>
                Przeglądaj katalog
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/25 bg-secondary/50 text-white hover:bg-secondary"
                render={<Link href="/#bestsellery" />}
              >
                Zobacz bestsellery
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Produkty cyfrowe gotowe do pobrania",
                "Architektura pod Supabase i Stripe",
                "Mobile-first, App Router, deploy-ready",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-border/70 bg-secondary/40 px-4 py-4 text-sm text-muted-foreground"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface-strong gold-frame flex min-h-64 flex-col justify-between p-5">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-primary/70">
                  Bestseller
                </p>
                <h2 className="text-3xl text-white">Planner Złota Rutyna</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Elegancki system planowania dnia, tygodnia i nawyków dla klientek,
                które chcą porządku bez surowości.
              </p>
            </div>

            <div className="surface-strong gold-frame flex min-h-64 flex-col justify-between bg-gradient-to-br from-primary/16 via-transparent to-white/6 p-5">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-primary/70">
                  Pakiet
                </p>
                <h2 className="text-3xl text-white">Premium Start</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Planner, finanse i rozwój osobisty w jednym zestawie wejściowym.
              </p>
            </div>

            <div className="surface-strong gold-frame col-span-full min-h-44 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-primary/70">
                Wrażenie premium
              </p>
              <p className="mt-4 max-w-xl text-lg leading-8 text-white/90">
                Estetyka jest tu narzędziem sprzedaży, ale pierwszeństwo ma czytelność,
                modularność i gotowość pod realne wdrożenie płatności oraz auth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

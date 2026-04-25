import Link from "next/link";
import { CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SiteSectionContent, StoreStat } from "@/types/store";

type HeroSectionProps = {
  content: SiteSectionContent;
  stats: StoreStat[];
};

const trustPoints = [
  {
    icon: Zap,
    title: "Natychmiastowy dostęp",
    description: "Pliki w bibliotece tuż po płatności.",
  },
  {
    icon: ShieldCheck,
    title: "14 dni na zwrot",
    description: "Bez pytań, bez formularzy.",
  },
  {
    icon: Sparkles,
    title: "Licencja do pracy",
    description: "Używasz w swoim biznesie bezterminowo.",
  },
];

export function HeroSection({ content, stats }: HeroSectionProps) {
  return (
    <section className="shell section-space relative overflow-hidden">
      <div className="surface-panel relative overflow-hidden p-6 sm:p-8 lg:p-12">
        <div className="hero-orb -top-8 right-10 size-36 bg-primary/18" />
        <div className="hero-orb bottom-8 left-8 size-28 bg-secondary" />

        <div className="relative grid gap-10 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:items-center">
          <div className="space-y-7">
            <span className="eyebrow">{content.eyebrow}</span>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance break-words text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
                {content.title}
              </h1>
              <p className="max-w-2xl break-words text-base leading-8 text-muted-foreground sm:text-lg">
                {content.description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href={content.ctaHref ?? "/produkty"} />}>
                {content.ctaLabel ?? "Przeglądaj katalog"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/#featured" />}
              >
                Zobacz bestsellery
              </Button>
            </div>

            <ul className="grid gap-3 pt-2 sm:grid-cols-3">
              {trustPoints.map((point) => (
                <li
                  key={point.title}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3"
                >
                  <point.icon className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{point.title}</p>
                    <p className="text-xs text-muted-foreground">{point.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative grid gap-4 sm:grid-cols-2">
            <article className="rounded-[2rem] border border-border/70 bg-gradient-to-br from-[#faf5ee] via-[#efe3d4] to-[#deceb8] p-6 shadow-[0_30px_70px_-50px_rgba(132,99,49,0.45)] dark:from-[#2e2922] dark:via-[#1b1712] dark:to-[#12100d]">
              <p className="text-xs uppercase tracking-[0.22em] text-foreground/65">
                Bestseller tygodnia
              </p>
              <h2 className="mt-4 text-3xl text-foreground">Pieniądze pod kontrolą</h2>
              <p className="mt-4 text-sm leading-7 text-foreground/72">
                Praktyczny system budżetu domowego. Bez Excela, bez wyrzeczeń. Wdrożysz w jeden wieczór.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-foreground/75">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" /> plan tygodnia finansowego
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" /> ukryte koszty i subskrypcje
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" /> poduszka finansowa krok po kroku
                </li>
              </ul>
            </article>

            <article className="rounded-[2rem] border border-border/70 bg-gradient-to-br from-[#fbf1ee] via-[#efd8d1] to-[#dcc2b9] p-6 shadow-[0_30px_70px_-50px_rgba(138,84,58,0.35)] dark:from-[#2f2521] dark:via-[#211713] dark:to-[#17100e]">
              <p className="text-xs uppercase tracking-[0.22em] text-foreground/65">
                Pakiet
              </p>
              <h2 className="mt-4 text-3xl text-foreground">Finanse domowe w jednym zestawie</h2>
              <p className="mt-4 text-sm leading-7 text-foreground/72">
                Budżet domowy + podstawy ekonomii. Wszystko, co potrzebujesz, by ogarnąć pieniądze.
              </p>
              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-2xl font-semibold text-foreground">79&nbsp;zł</span>
                <span className="text-sm text-foreground/60 line-through">88&nbsp;zł</span>
                <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                  −10%
                </span>
              </div>
            </article>

            <div className="sm:col-span-2 rounded-[2rem] border border-border/70 bg-background/70 p-5">
              <div className="grid gap-4 sm:grid-cols-3">
                {stats.slice(0, 3).map((stat) => (
                  <div key={stat.id}>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl text-foreground">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

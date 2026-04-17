import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { SiteSectionContent, StoreStat } from "@/types/store";

type HeroSectionProps = {
  content: SiteSectionContent;
  stats: StoreStat[];
};

export function HeroSection({ content, stats }: HeroSectionProps) {
  return (
    <section className="shell section-space relative overflow-hidden">
      <div className="surface-panel relative overflow-hidden p-6 sm:p-8 lg:p-12">
        <div className="hero-orb -top-8 right-10 size-36 bg-primary/18" />
        <div className="hero-orb bottom-8 left-8 size-28 bg-secondary" />

        <div className="relative grid gap-10 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
          <div className="space-y-7">
            <span className="eyebrow">{content.eyebrow}</span>
            <div className="space-y-5">
              <h1 className="max-w-5xl text-balance text-5xl leading-none text-foreground sm:text-6xl lg:text-7xl">
                {content.title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {content.description}
              </p>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                {content.body}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href={content.ctaHref ?? "/produkty"} />}>
                {content.ctaLabel ?? "Browse templates"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/#featured" />}
              >
                Zobacz bestsellery
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stats.slice(0, 3).map((stat) => (
                <div
                  key={stat.id}
                  className="rounded-[1.4rem] border border-border/70 bg-background/70 px-4 py-4"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-primary/80">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl text-foreground">{stat.value}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-border/70 bg-gradient-to-br from-[#faf5ee] via-[#efe3d4] to-[#deceb8] p-6 shadow-[0_30px_70px_-50px_rgba(132,99,49,0.45)] dark:from-[#2e2922] dark:via-[#1b1712] dark:to-[#12100d]">
              <p className="text-xs uppercase tracking-[0.22em] text-foreground/65">
                Bestseller
              </p>
              <h2 className="mt-4 text-3xl text-foreground">Notion CEO Week</h2>
              <p className="mt-4 text-sm leading-7 text-foreground/72">
                Weekly operating system for founders who want more clarity, better priorities and
                a calmer week.
              </p>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-gradient-to-br from-[#fbf1ee] via-[#efd8d1] to-[#dcc2b9] p-6 shadow-[0_30px_70px_-50px_rgba(138,84,58,0.35)] dark:from-[#2f2521] dark:via-[#211713] dark:to-[#17100e]">
              <p className="text-xs uppercase tracking-[0.22em] text-foreground/65">
                Premium bundle
              </p>
              <h2 className="mt-4 text-3xl text-foreground">Founders Operating Stack</h2>
              <p className="mt-4 text-sm leading-7 text-foreground/72">
                Planning, content and productivity systems packaged to create immediate momentum.
              </p>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-foreground px-6 py-7 text-background sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.22em] text-background/65">
                Editorial premium
              </p>
              <p className="mt-4 max-w-xl text-lg leading-8 text-background/88">
                Templify combines elegant presentation with real operations: auth, storage,
                fulfillment, legal pages and a CMS-lite admin layer for content and catalog.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

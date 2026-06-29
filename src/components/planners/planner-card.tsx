import Link from "next/link";
import { ArrowUpRight, Check, Cloud, Smartphone } from "lucide-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { InteractivePlanner } from "@/data/interactive-planners";

export function PlannerVisual({
  planner,
  compact = false,
}: {
  planner: InteractivePlanner;
  compact?: boolean;
}) {
  return (
    <div className={`relative isolate overflow-hidden bg-gradient-to-br ${planner.accent} ${compact ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
      <div className={`absolute -right-16 -top-16 size-48 rounded-full ${planner.glow} opacity-40 blur-3xl`} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="absolute inset-x-[8%] bottom-0 top-[12%] rounded-t-[1.4rem] border border-white/25 bg-white/92 p-3 shadow-2xl backdrop-blur sm:p-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <div className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${planner.glow}`} />
            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-stone-700 sm:text-[10px]">{planner.shortName}</span>
          </div>
          <div className="flex gap-1"><span className="size-1.5 rounded-full bg-stone-300" /><span className="size-1.5 rounded-full bg-stone-300" /></div>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_.72fr] gap-2">
          <div className="space-y-2">
            <div className="h-2.5 w-3/4 rounded-full bg-stone-800" />
            <div className="grid grid-cols-2 gap-1.5">
              <div className="h-12 rounded-lg bg-stone-100 p-2"><div className={`h-1.5 w-1/2 rounded-full ${planner.glow}`} /><div className="mt-2 h-2 w-3/4 rounded-full bg-stone-300" /></div>
              <div className="h-12 rounded-lg bg-stone-100 p-2"><div className="h-1.5 w-1/2 rounded-full bg-stone-300" /><div className="mt-2 h-2 w-1/2 rounded-full bg-stone-800" /></div>
            </div>
            <div className="space-y-1.5 rounded-lg bg-stone-100 p-2">
              {[72, 88, 58].map((width) => <div key={width} className="flex items-center gap-1.5"><span className={`size-2 rounded-full ${planner.glow}`} /><span className="h-1.5 rounded-full bg-stone-300" style={{ width: `${width}%` }} /></div>)}
            </div>
          </div>
          <div className="rounded-xl bg-stone-950 p-2.5 text-white">
            <div className="text-[7px] uppercase tracking-[.18em] text-white/50">Dzisiaj</div>
            <div className="mt-2 text-lg font-bold">84%</div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/15"><div className={`h-full w-4/5 rounded-full ${planner.glow}`} /></div>
            <div className="mt-3 h-1.5 w-3/4 rounded-full bg-white/20" />
            <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlannerLivePreview({
  planner,
}: {
  planner: InteractivePlanner;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-stone-950 shadow-[0_35px_100px_-48px_rgba(0,0,0,.65)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-stone-950 px-4 py-3 text-white sm:px-5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-300" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </div>
        <p className="truncate text-[10px] font-semibold uppercase tracking-[.2em] text-white/60 sm:text-xs">
          Prawdziwy podgląd — możesz klikać
        </p>
        <span className="hidden rounded-full border border-white/15 px-2.5 py-1 text-[10px] text-white/55 sm:inline">
          {planner.name}
        </span>
      </div>
      <iframe
        src={`/api/planners/${planner.slug}/embed?mode=demo`}
        title={`Interaktywny podgląd planera ${planner.name}`}
        sandbox="allow-scripts allow-forms allow-modals"
        loading="eager"
        className="block h-[570px] w-full bg-white sm:h-[650px] lg:h-[680px]"
      />
    </div>
  );
}

export function PlannerCard({ planner }: { planner: InteractivePlanner }) {
  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-border/70 bg-card/65 shadow-[0_24px_70px_-45px_rgba(0,0,0,.45)] transition duration-500 hover:-translate-y-1 hover:border-foreground/20">
      <Link href={`/planery/${planner.slug}`} className="block overflow-hidden">
        <PlannerVisual planner={planner} compact />
      </Link>
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="bg-background/65">{planner.audience}</Badge>
          <span className="text-sm font-semibold text-foreground">{formatCurrency(planner.price)}</span>
        </div>
        <div>
          <Link href={`/planery/${planner.slug}`} className="inline-flex min-h-10 items-center gap-2 text-2xl font-semibold tracking-[-0.03em] text-foreground hover:text-primary">
            {planner.name}<ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{planner.tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Cloud className="size-3.5 text-primary" />Autosave</span>
          <span className="flex items-center gap-1.5"><Smartphone className="size-3.5 text-primary" />Telefon + komputer</span>
        </div>
        <ul className="space-y-2">
          {planner.features.slice(0, 3).map((feature) => <li key={feature} className="flex items-center gap-2 text-sm text-foreground"><Check className="size-3.5 text-primary" />{feature}</li>)}
        </ul>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" render={<Link href={`/planery/${planner.slug}`} />}>Zobacz planer</Button>
          <AddToCartButton product={{ id: planner.id, slug: planner.slug, name: planner.name, category: planner.category, shortDescription: planner.description, price: planner.price, coverGradient: planner.accent }} fullWidth />
        </div>
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Cloud, LockKeyhole, Smartphone, Sparkles } from "lucide-react";

import { PlannerCard, PlannerVisual } from "@/components/planners/planner-card";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInteractivePlanner, interactivePlanners } from "@/data/interactive-planners";
import { formatCurrency } from "@/lib/format";

export function generateStaticParams() {
  return interactivePlanners.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const planner = getInteractivePlanner(slug);
  if (!planner) return {};
  return { title: `${planner.name} — interaktywny planer`, description: planner.description };
}

export default async function PlannerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const planner = getInteractivePlanner(slug);
  if (!planner) notFound();
  const related = interactivePlanners.filter((item) => item.audience === planner.audience && item.slug !== planner.slug).slice(0, 2);

  return (
    <main className="shell section-space">
      <Link href="/planery" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Wszystkie planery</Link>
      <section className="mt-6 grid gap-8 lg:grid-cols-[1.04fr_.96fr] lg:items-start">
        <div className="overflow-hidden rounded-[2rem] border border-border/60 shadow-[0_35px_100px_-48px_rgba(0,0,0,.6)]"><PlannerVisual planner={planner} /></div>
        <div className="surface-panel p-6 sm:p-8 lg:sticky lg:top-28">
          <div className="flex flex-wrap gap-2"><Badge>{planner.audience}</Badge><Badge variant="outline">Interaktywny planer</Badge></div>
          <h1 className="mt-5 text-4xl text-foreground sm:text-6xl">{planner.name}</h1>
          <p className="mt-4 text-xl font-medium leading-8 text-foreground">{planner.tagline}</p>
          <p className="mt-4 leading-7 text-muted-foreground">{planner.description}</p>
          <div className="mt-6 rounded-2xl bg-primary/10 p-4 text-sm font-medium text-foreground"><Sparkles className="mr-2 inline size-4 text-primary" />{planner.promise}</div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">{planner.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-sm text-foreground"><Check className="size-4 text-primary" />{feature}</li>)}</ul>
          <div className="mt-7 flex items-end justify-between border-t border-border/60 pt-6"><div><p className="text-xs uppercase tracking-[.2em] text-muted-foreground">Płacisz raz</p><p className="mt-1 text-4xl font-semibold text-foreground">{formatCurrency(planner.price)}</p></div><span className="text-right text-xs leading-5 text-muted-foreground">Dostęp bezterminowy<br />Aktualizacje w cenie</span></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2"><AddToCartButton product={{ id: planner.id, slug: planner.slug, name: planner.name, category: planner.category, shortDescription: planner.description, price: planner.price, coverGradient: planner.accent }} fullWidth /><Button size="lg" variant="outline" render={<Link href={`/planery/${planner.slug}/demo`} />}>Uruchom demo<ArrowRight className="size-4" /></Button></div>
          <div className="mt-6 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3"><span className="flex items-center gap-1.5"><Cloud className="size-3.5 text-primary" />Autosave</span><span className="flex items-center gap-1.5"><Smartphone className="size-3.5 text-primary" />Każde urządzenie</span><span className="flex items-center gap-1.5"><LockKeyhole className="size-3.5 text-primary" />Prywatny dostęp</span></div>
        </div>
      </section>
      <section className="mt-20"><span className="eyebrow">Zobacz też</span><h2 className="mt-5 text-4xl text-foreground">Inne planery dla Ciebie</h2><div className="mt-8 grid gap-6 lg:grid-cols-2">{related.map((item) => <PlannerCard key={item.slug} planner={item} />)}</div></section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Cloud, LockKeyhole, Smartphone, Sparkles } from "lucide-react";

import { PlannerCard, PlannerLivePreview } from "@/components/planners/planner-card";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInteractivePlanner, interactivePlanners } from "@/data/interactive-planners";
import { formatCurrency } from "@/lib/format";
import { buildCanonicalMetadata, getCanonicalUrl, safeJsonLd } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import { getOwnedProductIds } from "@/lib/supabase/store";

export function generateStaticParams() {
  return interactivePlanners.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const planner = getInteractivePlanner(slug);
  if (!planner) return {};
  return buildCanonicalMetadata({
    title: `${planner.name} — interaktywny planer online`,
    description: planner.description,
    path: `/planery/${planner.slug}`,
    image: `/api/planners/${planner.slug}/opengraph-image`,
  });
}

export default async function PlannerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const planner = getInteractivePlanner(slug);
  if (!planner) notFound();
  const user = await getCurrentUser();
  const ownedProductIds = await getOwnedProductIds(user?.id ?? null);
  const isOwned = ownedProductIds.has(planner.id);
  const related = interactivePlanners.filter((item) => item.audience === planner.audience && item.slug !== planner.slug).slice(0, 2);
  const plannerUrl = getCanonicalUrl(`/planery/${planner.slug}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": ["Product", "SoftwareApplication"],
    name: planner.name,
    description: planner.description,
    sku: planner.slug,
    productID: planner.id,
    category: planner.category,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    url: plannerUrl,
    image: getCanonicalUrl(`/api/planners/${planner.slug}/opengraph-image`),
    offers: {
      "@type": "Offer",
      price: String(planner.price),
      priceCurrency: "PLN",
      availability: "https://schema.org/InStock",
      url: plannerUrl,
    },
    featureList: planner.features.join(", "),
    brand: { "@type": "Brand", name: "Templify" },
  };

  return (
    <main className="shell section-space">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
      <Link href="/planery" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Wszystkie planery</Link>
      <section className="mt-6 grid gap-8 lg:grid-cols-[1.04fr_.96fr] lg:items-start">
        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="eyebrow">Zajrzyj do środka</span>
              <h2 className="mt-3 text-2xl text-foreground sm:text-3xl">To nie okładka. To działający planer.</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">Klikaj w menu i sprawdź prawdziwe widoki przed zakupem.</p>
          </div>
          <PlannerLivePreview planner={planner} />
        </div>
        <div className="surface-panel p-6 sm:p-8 lg:sticky lg:top-28">
          <div className="flex flex-wrap gap-2"><Badge>{planner.audience}</Badge><Badge variant="outline">Interaktywny planer</Badge>{isOwned ? <Badge variant="outline" className="border-emerald-700/30 bg-emerald-50/95 text-emerald-900"><CheckCircle2 className="mr-1 size-3" />W bibliotece</Badge> : null}</div>
          <h1 className="mt-5 text-4xl text-foreground sm:text-6xl">{planner.name}</h1>
          <p className="mt-4 text-xl font-medium leading-8 text-foreground">{planner.tagline}</p>
          <p className="mt-4 leading-7 text-muted-foreground">{planner.description}</p>
          <div className="mt-6 rounded-2xl bg-primary/10 p-4 text-sm font-medium text-foreground"><Sparkles className="mr-2 inline size-4 text-primary" />{planner.promise}</div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">{planner.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-sm text-foreground"><Check className="size-4 text-primary" />{feature}</li>)}</ul>
          <div className="mt-7 flex items-end justify-between border-t border-border/60 pt-6"><div><p className="text-xs uppercase tracking-[.2em] text-muted-foreground">Płacisz raz</p><p className="mt-1 text-4xl font-semibold text-foreground">{formatCurrency(planner.price)}</p></div><span className="text-right text-xs leading-5 text-muted-foreground">Dostęp bezterminowy<br />Aktualizacje w cenie</span></div>
          {isOwned ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-emerald-700/20 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-950">
                Masz już ten planer na swoim koncie — możesz otworzyć go od razu, bez ponownego zakupu.
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button size="lg" render={<Link href={`/narzedzia/${planner.slug}`} />}><Sparkles className="size-4" />Otwórz mój planer</Button>
                <Button size="lg" variant="outline" render={<Link href="/biblioteka" />}>Przejdź do biblioteki</Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><AddToCartButton product={{ id: planner.id, slug: planner.slug, name: planner.name, category: planner.category, shortDescription: planner.description, price: planner.price, coverGradient: planner.accent }} fullWidth /><Button size="lg" variant="outline" render={<Link href={`/planery/${planner.slug}/demo`} />}>Uruchom demo<ArrowRight className="size-4" /></Button></div>
          )}
          <div className="mt-6 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3"><span className="flex items-center gap-1.5"><Cloud className="size-3.5 text-primary" />Autosave</span><span className="flex items-center gap-1.5"><Smartphone className="size-3.5 text-primary" />Każde urządzenie</span><span className="flex items-center gap-1.5"><LockKeyhole className="size-3.5 text-primary" />Prywatny dostęp</span></div>
        </div>
      </section>
      <section className="mt-20"><span className="eyebrow">Zobacz też</span><h2 className="mt-5 text-4xl text-foreground">Inne planery dla Ciebie</h2><div className="mt-8 grid gap-6 lg:grid-cols-2">{related.map((item) => <PlannerCard key={item.slug} planner={item} isOwned={ownedProductIds.has(item.id)} />)}</div></section>
    </main>
  );
}

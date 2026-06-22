import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Coins,
  LineChart,
  PenLine,
  Smartphone,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import type { CategoryHighlight, SiteSectionContent } from "@/types/store";

type CatalogSectionProps = {
  content: SiteSectionContent;
  categories: CategoryHighlight[];
  // Real per-category counts (keyed by category NAME, matching what the
  // homepage snapshot emits). Used to show a truthful "X produktów" line on
  // each tile instead of the historic mock-data count, which kept claiming
  // products that never existed in Supabase.
  categoryProductCounts?: Record<string, number>;
  plannerCount?: number;
};

const categoryIcons: Record<string, LucideIcon> = {
  "planowanie-i-notion": Calendar,
  "content-i-marketing": PenLine,
  "sprzedaz-i-oferty": Target,
  "finanse-i-operacje": Coins,
  "produktywnosc-osobista": LineChart,
};

function pickIcon(slug: string) {
  return categoryIcons[slug] ?? Sparkles;
}

export function CatalogSection({
  content,
  categories,
  categoryProductCounts = {},
  plannerCount = 0,
}: CatalogSectionProps) {
  const getCountForCategory = (category: CategoryHighlight) =>
    categoryProductCounts[category.title] ?? 0;

  return (
    <section id="use-cases" className="shell section-space">
      <div className="space-y-10">
        <SectionHeading
          badge={content.eyebrow}
          title={content.title}
          description={content.description}
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {plannerCount > 0 ? (
            <Link
              href="/planery"
              className="group relative isolate overflow-hidden rounded-[2rem] border border-stone-950/10 bg-[#171510] p-6 text-white shadow-[0_24px_70px_-36px_rgba(0,0,0,.8)] transition hover:-translate-y-1"
            >
              <div className="absolute -right-16 -top-16 size-48 rounded-full bg-emerald-400/25 blur-3xl" />
              <div className="absolute -bottom-20 -left-12 size-52 rounded-full bg-violet-500/25 blur-3xl" />
              <div className="relative flex h-full flex-col gap-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-emerald-300">
                    <Smartphone className="size-5" />
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">
                    Interaktywne
                  </span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl" style={{ color: "#fff" }}>Planery i template’y online</h3>
                  <p className="text-sm leading-7 text-white/65">
                    Finanse, rodzina, posiłki, podróże i praca. Automatyczny zapis oraz prywatny dostęp z telefonu.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Bez Excela</p>
                  <p className="mt-2 text-sm text-white">{plannerCount} interaktywnych planerów</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  Zobacz planery
                  <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          ) : null}
          {categories.map((category) => {
            const Icon = pickIcon(category.slug);
            const productCount = getCountForCategory(category);

            return (
              <Link
                key={category.slug}
                href={`/produkty?kategoria=${encodeURIComponent(category.title)}`}
                className="group surface-panel flex flex-col gap-5 p-6 transition hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-background/80 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">
                    Kategoria
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="break-words text-2xl text-foreground">{category.title}</h3>
                  <p className="line-clamp-3 max-w-md break-words text-sm leading-7 text-muted-foreground">
                    {category.description}
                  </p>
                </div>

                <div className="rounded-[1.25rem] border border-border/70 bg-background/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary/75">
                    Szybki start
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {productCount}{" "}
                    {productCount === 1 ? "e-book" : "e-booków"}
                  </p>
                </div>

                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Zobacz produkty
                  <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{content.body}</p>
      </div>
    </section>
  );
}

import Link from "next/link";
import {
  ArrowUpRight,
  Calendar,
  Coins,
  LineChart,
  PenLine,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import type { CategoryHighlight, SiteSectionContent } from "@/types/store";

type CatalogSectionProps = {
  content: SiteSectionContent;
  categories: CategoryHighlight[];
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

export function CatalogSection({ content, categories }: CatalogSectionProps) {
  return (
    <section id="use-cases" className="shell section-space">
      <div className="space-y-10">
        <SectionHeading
          badge={content.eyebrow}
          title={content.title}
          description={content.description}
        />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = pickIcon(category.slug);
            const isFeatured = index === 0;

            return (
              <Link
                key={category.slug}
                href={`/produkty?kategoria=${encodeURIComponent(category.title)}`}
                className={`group surface-panel relative flex flex-col gap-5 overflow-hidden p-6 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_40px_120px_-40px_rgba(139,94,52,0.3)] ${
                  isFeatured ? "md:col-span-2 lg:row-span-2" : ""
                }`}
              >
                <div
                  aria-hidden
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${category.accent} opacity-60 transition-opacity duration-500 group-hover:opacity-90`}
                />
                <div
                  aria-hidden
                  className="absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60 blur-3xl transition duration-500 group-hover:opacity-100"
                />

                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-background/80 text-primary shadow-[0_12px_30px_-18px_rgba(139,94,52,0.4)] backdrop-blur">
                    <Icon className="size-5" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80 backdrop-blur">
                    Kategoria
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className={`text-foreground ${isFeatured ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
                    {category.title}
                  </h3>
                  <p className="max-w-md text-sm leading-7 text-foreground/75">
                    {category.description}
                  </p>
                </div>

                <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Zobacz kategorię
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

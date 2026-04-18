import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import type { CategoryHighlight, SiteSectionContent } from "@/types/store";

type CatalogSectionProps = {
  content: SiteSectionContent;
  categories: CategoryHighlight[];
};

export function CatalogSection({ content, categories }: CatalogSectionProps) {
  return (
    <section id="use-cases" className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge={content.eyebrow}
          title={content.title}
          description={content.description}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {categories.map((category) => (
            <article key={category.slug} className="surface-panel p-5">
              <div
                className={`mb-6 h-28 rounded-[1.6rem] border border-border/70 bg-gradient-to-br ${category.accent}`}
              />
              <h3 className="text-2xl text-foreground">{category.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {category.description}
              </p>
              <Link
                href={`/produkty?kategoria=${encodeURIComponent(category.title)}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
              >
                Zobacz kategorię <ArrowUpRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>

        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{content.body}</p>
      </div>
    </section>
  );
}

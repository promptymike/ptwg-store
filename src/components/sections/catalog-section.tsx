import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { categoryHighlights } from "@/data/mock-store";

export function CatalogSection() {
  return (
    <section id="katalog" className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge="Katalog"
          title="Pięć kategorii zbudowanych pod rozwój cyfrowego brandu"
          description="Każda kategoria ma już mock dane, opisy i ścieżkę filtrowania. Dzięki temu MVP można szybko rozszerzyć o prawdziwą bazę produktów."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {categoryHighlights.map((category) => (
            <article key={category.slug} className="surface-panel gold-frame p-5">
              <div
                className={`mb-6 h-28 rounded-[1.4rem] border border-border/70 bg-gradient-to-br ${category.accent}`}
              />
              <h3 className="text-2xl text-white">{category.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {category.description}
              </p>
              <Link
                href={`/produkty?kategoria=${encodeURIComponent(category.title)}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
              >
                Filtruj katalog <ArrowUpRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

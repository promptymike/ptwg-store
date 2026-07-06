import Link from "next/link";
import { ArrowUpRight, BookOpen, LibraryBig, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInteractivePlanner } from "@/data/interactive-planners";
import type { LibraryItemSnapshot } from "@/lib/supabase/store";

type OwnedProductsSectionProps = {
  items: LibraryItemSnapshot[];
};

/**
 * Quick-access strip for logged-in owners, rendered right under the hero.
 * Buyers land on the homepage and jump straight back into their planners
 * and ebooks instead of walking the catalog → cart path again.
 */
export function OwnedProductsSection({ items }: OwnedProductsSectionProps) {
  if (items.length === 0) {
    return null;
  }

  const visible = items.slice(0, 4);

  return (
    <section className="shell pt-10 sm:pt-12" aria-label="Twoje produkty">
      <div className="surface-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge className="border-0 bg-primary/12 text-primary">
              Twoja biblioteka
            </Badge>
            <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
              Wróć tam, gdzie skończyłeś
            </h2>
          </div>
          <Button variant="outline" render={<Link href="/biblioteka" />}>
            <LibraryBig className="size-4" />
            Cała biblioteka
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((item) => {
            const planner = getInteractivePlanner(item.slug);
            const href = planner
              ? `/narzedzia/${item.slug}`
              : `/api/library/${item.productId}/read`;

            return (
              <Link
                key={item.id}
                href={href}
                target={planner ? undefined : "_blank"}
                rel={planner ? undefined : "noopener noreferrer"}
                className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 transition hover:-translate-y-0.5 hover:border-primary/40"
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.coverGradient} text-stone-950`}
                >
                  {planner ? (
                    <Sparkles className="size-4" />
                  ) : (
                    <BookOpen className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {item.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {planner ? "Otwórz planer" : "Czytaj dalej"}
                  </span>
                </span>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

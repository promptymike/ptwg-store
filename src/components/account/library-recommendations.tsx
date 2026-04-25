import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/store";

type LibraryRecommendationsProps = {
  recommendations: Product[];
  ownedProductIds: Set<string>;
  /** Used to colour the eyebrow with the buyer's strongest reading category. */
  topCategory: string | null;
};

export function LibraryRecommendations({
  recommendations,
  ownedProductIds,
  topCategory,
}: LibraryRecommendationsProps) {
  if (recommendations.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.24em] text-primary/75">
            <Sparkles className="size-3.5" />
            Pasuje do tego, co czytasz
          </p>
          <h2 className="text-2xl text-foreground sm:text-3xl">
            {topCategory
              ? `Skoro lubisz ${topCategory.toLowerCase()}, sprawdź też`
              : "Mogłoby się przydać dalej"}
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Wybór z kategorii, które już są w Twojej bibliotece. Bezpieczniejszy
            zakup niż random — wiesz, że styl Ci pasuje.
          </p>
        </div>
        <Button variant="outline" render={<Link href="/produkty" />}>
          Cały katalog
          <ArrowUpRight className="size-4" />
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isOwned={ownedProductIds.has(product.id)}
          />
        ))}
      </div>
    </section>
  );
}

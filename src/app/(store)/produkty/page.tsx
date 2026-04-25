import type { Metadata } from "next";

import { CategoryFilterBar } from "@/components/products/category-filter-bar";
import { ProductCard } from "@/components/products/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { CATEGORY_OPTIONS } from "@/types/store";
import {
  getCategoryFilterOptions,
  getStoreProducts,
} from "@/lib/supabase/store";
import { buildCanonicalMetadata } from "@/lib/seo";

export const metadata: Metadata = buildCanonicalMetadata({
  title: "Produkty",
  description:
    "Przeglądaj premium szablony Templify: planowanie, content, sprzedaż, finanse i produktywność osobista.",
  path: "/produkty",
});

type ProductsPageProps = {
  searchParams: Promise<{
    kategoria?: string;
  }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const category = CATEGORY_OPTIONS.includes(
    resolvedSearchParams.kategoria as (typeof CATEGORY_OPTIONS)[number],
  )
    ? resolvedSearchParams.kategoria
    : undefined;
  const [allProducts, allCategories] = await Promise.all([
    getStoreProducts(),
    getCategoryFilterOptions(),
  ]);

  const products = category
    ? allProducts.filter((p) => p.category === category)
    : allProducts;
  const populatedCategories = new Set(allProducts.map((p) => p.category));
  const categories = allCategories.filter((c) => populatedCategories.has(c));

  return (
    <div className="shell section-space space-y-8">
      <SectionHeading
        badge="Katalog"
        title="Premium szablony cyfrowe dla założycieli, twórców i marek usługowych"
        description="Templify układa szablony według tego, co dają w pracy: planowanie, content, oferty, finanse i spokojniejsze codzienne operacje."
      />

      <div className="surface-panel space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilterBar activeCategory={category} categories={categories} />
          <p className="text-sm text-muted-foreground">
            Wyniki: <span className="text-foreground">{products.length}</span>
          </p>
        </div>

        {products.length === 0 ? (
          <EmptyState
            badge="Brak wyników"
            title="Nie znaleziono produktów w tej kategorii"
            description="Spróbuj wrócić do wszystkich produktów albo wybierz inny use case z paska filtrowania."
            action={{ href: "/produkty", label: "Pokaż wszystkie produkty" }}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

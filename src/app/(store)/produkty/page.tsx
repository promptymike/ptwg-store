import type { Metadata } from "next";
import { SearchX } from "lucide-react";

import { CategoryFilterBar } from "@/components/products/category-filter-bar";
import { FormatFilterBar } from "@/components/products/format-filter-bar";
import { ProductCard } from "@/components/products/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { CATEGORY_OPTIONS } from "@/types/store";
import {
  getCategoryFilterOptions,
  getOwnedProductIds,
  getStoreProducts,
} from "@/lib/supabase/store";
import { getCurrentUser } from "@/lib/session";
import { buildCanonicalMetadata } from "@/lib/seo";
import { getInteractivePlanner } from "@/data/interactive-planners";

export const metadata: Metadata = buildCanonicalMetadata({
  title: "Produkty",
  description:
    "Przeglądaj praktyczne ebooki Templify: finanse, zdrowie, fitness, macierzyństwo, produktywność, mindset, praca i podróże.",
  path: "/produkty",
});

type ProductsPageProps = {
  searchParams: Promise<{
    kategoria?: string;
    typ?: string;
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
  const [allProducts, allCategories, user] = await Promise.all([
    getStoreProducts(),
    getCategoryFilterOptions(),
    getCurrentUser(),
  ]);
  const ownedProductIds = await getOwnedProductIds(user?.id ?? null);

  // /produkty is the ebook shelf. Interactive planners have their own,
  // purpose-built storefront under /planery and should not leak into this
  // listing just because they also exist in the shared products table.
  const ebookProducts = allProducts.filter(
    (product) => !getInteractivePlanner(product.slug),
  );

  const formatOptions = Array.from(
    new Set(ebookProducts.map((p) => p.format).filter(Boolean) as string[]),
  ).sort();
  const format = formatOptions.includes(resolvedSearchParams.typ ?? "")
    ? resolvedSearchParams.typ
    : undefined;

  const products = ebookProducts.filter(
    (p) =>
      (!category || p.category === category) &&
      (!format || p.format === format),
  );
  const populatedCategories = new Set(ebookProducts.map((p) => p.category));
  const categories = allCategories.filter((c) => populatedCategories.has(c));

  return (
    <div className="shell section-space space-y-8">
      {/* Visible heading is h2 so that the page-h1 belongs to the
          product page after navigation — keeps end-to-end tests stable
          and avoids two h1s in the document on the way to a product. */}
      <SectionHeading
        badge="Katalog"
        title="Praktyczne e-booki dla każdego obszaru życia"
        description="W tej sekcji znajdziesz wyłącznie e-booki. Interaktywne narzędzia z automatycznym zapisem czekają w osobnej kolekcji Planery."
      />

      <div className="surface-panel space-y-5 p-6">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-primary/75">
            Kategorie
          </p>
          <CategoryFilterBar
            activeCategory={category}
            categories={categories}
            preserveFormat={format}
          />
        </div>

        {formatOptions.length > 1 ? (
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary/75">
              Typ
            </p>
            <FormatFilterBar
              activeFormat={format}
              formats={formatOptions}
              preserveCategory={category}
            />
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground">
          Wyniki: <span className="text-foreground">{products.length}</span>
          {category || format ? (
            <>
              {" "}— filtry:{" "}
              {[category, format].filter(Boolean).map((label, idx, arr) => (
                <span key={label}>
                  <span className="text-foreground">{label}</span>
                  {idx < arr.length - 1 ? ", " : ""}
                </span>
              ))}
            </>
          ) : null}
        </p>

        {products.length === 0 ? (
          <EmptyState
            icon={SearchX}
            badge="Brak wyników"
            title="Nie znaleziono produktów w tej kategorii"
            description="Spróbuj wrócić do wszystkich produktów albo wybierz inny obszar życia z filtra powyżej."
            action={{ href: "/produkty", label: "Pokaż wszystkie produkty" }}
            secondaryAction={{ href: "/test", label: "Zrób test dopasowania" }}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isOwned={ownedProductIds.has(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

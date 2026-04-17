import { CategoryFilterBar } from "@/components/products/category-filter-bar";
import { ProductCard } from "@/components/products/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { CATEGORY_OPTIONS } from "@/types/store";
import { getProductsByCategory } from "@/data/mock-store";

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
  const products = getProductsByCategory(category);

  return (
    <div className="shell section-space space-y-8">
      <SectionHeading
        badge="Listing produktów"
        title="Katalog cyfrowych produktów premium"
        description="Filtrowanie działa po kategoriach i jest gotowe do przyszłego przejścia na query do Supabase. Każda karta prowadzi do dedykowanej strony produktu."
      />

      <div className="surface-panel gold-frame space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CategoryFilterBar activeCategory={category} />
          <p className="text-sm text-muted-foreground">
            Wyniki: <span className="text-white">{products.length}</span>
          </p>
        </div>

        {products.length === 0 ? (
          <EmptyState
            badge="Brak wyników"
            title="Nie znaleziono produktów w tej kategorii"
            description="Spróbuj wrócić do wszystkich produktów lub wybierz inną kategorię z paska filtrowania."
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

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/store";

type NewArrivalsSectionProps = {
  products: Product[];
};

/**
 * "Nowości" strip surfaces products admins have explicitly tagged with the
 * `new` badge. The storefront snapshot already de-duplicates it against the
 * bestseller section so the two lanes read as distinct merchandising choices
 * even when the catalog is small. Rendering is skipped entirely when the
 * snapshot returns nothing to promote — better a tight layout than an empty
 * strip with a heading and no cards.
 */
export function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id="nowosci" className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge="Nowości"
          title="Świeże szablony w ofercie"
          description="Dopiero dodaliśmy je do biblioteki. Sprawdź, zanim staną się kolejnym bestsellerem."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} priority="featured" />
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex max-w-2xl items-start gap-3 text-sm leading-7 text-muted-foreground">
            <Sparkles className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
            <span className="break-words">
              Sekcja odświeża się, gdy admin oznaczy kolejny produkt etykietą „Nowość”.
              Każdy z nich ma licencję do pracy i zwrot w 14 dni, tak jak reszta biblioteki.
            </span>
          </p>
          <Button variant="outline" size="lg" render={<Link href="/produkty" />}>
            Zobacz wszystkie produkty
          </Button>
        </div>
      </div>
    </section>
  );
}

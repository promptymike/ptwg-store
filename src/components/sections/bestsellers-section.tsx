import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { Product, SiteSectionContent } from "@/types/store";

type BestsellersSectionProps = {
  content: SiteSectionContent;
  products: Product[];
  ownedProductIds?: Set<string>;
};

export function BestsellersSection({
  content,
  products,
  ownedProductIds,
}: BestsellersSectionProps) {
  return (
    <section id="featured" className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge={content.eyebrow}
          title={content.title}
          description={content.description}
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              priority="featured"
              isOwned={ownedProductIds?.has(product.id)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            {content.body}
          </p>
          <Button variant="outline" size="lg" render={<Link href={content.ctaHref ?? "/produkty"} />}>
            {content.ctaLabel ?? "Zobacz katalog"}
          </Button>
        </div>
      </div>
    </section>
  );
}

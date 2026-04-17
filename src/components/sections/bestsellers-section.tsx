import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { bestsellerProducts } from "@/data/mock-store";

export function BestsellersSection() {
  return (
    <section id="bestsellery" className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge="Bestsellery"
          title="Produkty, od których najłatwiej zacząć sprzedaż"
          description="Wybrane pozycje spinają cały klimat sklepu: wysoka estetyka, jasna wartość i kategorie, które łatwo dalej rozwijać."
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {bestsellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} priority="featured" />
          ))}
        </div>

        <Button variant="outline" size="lg" render={<Link href="/produkty" />}>
          Zobacz cały katalog
        </Button>
      </div>
    </section>
  );
}

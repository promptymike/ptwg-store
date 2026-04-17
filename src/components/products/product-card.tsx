import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@/types/store";
import { formatCurrency } from "@/lib/format";

type ProductCardProps = {
  product: Product;
  priority?: "default" | "featured";
};

export function ProductCard({
  product,
  priority = "default",
}: ProductCardProps) {
  return (
    <article className="surface-panel gold-frame flex h-full flex-col overflow-hidden">
      <div
        className={`relative min-h-56 overflow-hidden border-b border-border/70 bg-gradient-to-br ${product.coverGradient} p-6`}
      >
        <div className="hero-orb right-4 top-4 size-20 bg-primary/30" />
        <div className="hero-orb bottom-5 left-5 size-16 bg-white/10" />

        <div className="relative flex h-full flex-col justify-between gap-8">
          <div className="flex items-center justify-between">
            <Badge
              className={`border-0 bg-gradient-to-r ${product.accent} text-[11px] uppercase tracking-[0.24em] text-brand-foreground`}
            >
              {product.category}
            </Badge>
            {product.bestseller ? (
              <Badge variant="outline" className="border-primary/30 text-white">
                Bestseller
              </Badge>
            ) : null}
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.26em] text-primary/70">
              {product.heroNote}
            </p>
            <h3 className="max-w-xs text-3xl text-white">{product.name}</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{product.format}</span>
          <span>{product.pages} stron</span>
          <span className="inline-flex items-center gap-1 text-white">
            <Star className="size-3.5 fill-primary text-primary" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            {product.shortDescription}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">
            {product.salesLabel}
          </p>
        </div>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-white">
                {formatCurrency(product.price)}
              </p>
              {product.compareAtPrice ? (
                <p className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.compareAtPrice)}
                </p>
              ) : null}
            </div>
            <Link
              href={`/produkty/${product.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
            >
              Szczegóły <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <AddToCartButton
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              category: product.category,
              shortDescription: product.shortDescription,
              price: product.price,
              coverGradient: product.coverGradient,
            }}
            fullWidth={priority === "featured"}
          />
        </div>
      </div>
    </article>
  );
}

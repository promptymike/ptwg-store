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

function getBadgeLabel(product: Product) {
  if (product.badge) {
    return product.badge;
  }

  if (product.bestseller) {
    return "bestseller";
  }

  if (product.featured) {
    return "featured";
  }

  return null;
}

export function ProductCard({
  product,
  priority = "default",
}: ProductCardProps) {
  const badgeLabel = getBadgeLabel(product);

  const productHref = `/produkty/${product.slug}`;

  return (
    <article className="surface-panel group flex h-full flex-col overflow-hidden transition hover:border-primary/30">
      <Link href={productHref} className="block" aria-label={`Zobacz produkt: ${product.name}`}>
        <div
          className={`relative min-h-64 overflow-hidden border-b border-border/70 bg-gradient-to-br ${product.coverGradient} p-6 transition group-hover:brightness-105`}
        >
          <div className="hero-orb right-5 top-5 size-24 bg-white/45" />
          <div className="hero-orb bottom-6 left-6 size-20 bg-primary/25" />

          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="flex items-center justify-between gap-3">
              <Badge
                className={`border-0 bg-gradient-to-r ${product.accent} text-[11px] uppercase tracking-[0.22em] text-brand-foreground`}
              >
                {product.category}
              </Badge>
              {badgeLabel ? (
                <Badge variant="outline" className="border-foreground/15 bg-background/75 text-foreground">
                  {badgeLabel}
                </Badge>
              ) : null}
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-foreground/65">
                {product.heroNote}
              </p>
              <h3 className="max-w-xs text-3xl text-foreground">{product.name}</h3>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{product.format}</span>
          <span>{product.pages} stron</span>
          <span className="inline-flex items-center gap-1 text-foreground">
            <Star className="size-3.5 fill-primary text-primary" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <Link href={productHref} className="block space-y-3">
          <p className="text-sm leading-7 text-muted-foreground transition group-hover:text-foreground/80">
            {product.shortDescription}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-primary/80">
            {product.salesLabel}
          </p>
        </Link>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(product.price)}
              </p>
              {product.compareAtPrice ? (
                <p className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.compareAtPrice)}
                </p>
              ) : null}
            </div>
            <Link
              href={productHref}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary/80"
            >
              Zobacz produkt
              <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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

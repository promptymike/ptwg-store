import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { getCoverImageOverlayOpacity } from "@/lib/product";
import { type Product } from "@/types/store";

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
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const productHref = `/produkty/${product.slug}`;
  const coverOverlayOpacity = getCoverImageOverlayOpacity(product);

  return (
    <article className="surface-panel group flex h-full flex-col overflow-hidden transition hover:border-primary/30">
      <Link href={productHref} className="block" aria-label={`Zobacz produkt: ${product.name}`}>
        <div
          className={`relative min-h-64 overflow-hidden border-b border-border/70 bg-gradient-to-br ${product.coverGradient} p-6 transition group-hover:brightness-105`}
        >
          <div className="hero-orb right-5 top-5 size-20 bg-white/35" />
          <div className="hero-orb bottom-6 left-6 size-16 bg-primary/18" />

          {product.coverImageUrl && coverOverlayOpacity > 0 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition group-hover:scale-[1.02]"
              style={{
                backgroundImage: `url(${product.coverImageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                opacity: coverOverlayOpacity,
              }}
            />
          ) : null}

          {/* Soft dark gradient at the bottom so the product title always
              passes contrast against the pastel cover background, in both
              light and dark themes (foreground colour flips per theme but
              the cover gradient stays pastel either way). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-stone-950/35 via-stone-950/10 to-transparent"
          />

          {discountPercent ? (
            <span className="absolute left-1/2 top-0 z-10 inline-flex -translate-x-1/2 translate-y-3 items-center gap-1 rounded-full bg-destructive px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white shadow-[0_10px_30px_-10px_rgba(185,76,66,0.65)]">
              -{discountPercent}%
            </span>
          ) : null}

          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="flex items-center justify-between gap-3">
              <Badge
                className={`border-0 bg-stone-950/85 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-50 backdrop-blur-sm`}
              >
                {product.category}
              </Badge>
              {badgeLabel ? (
                <Badge
                  variant="outline"
                  className="border-stone-950/15 bg-stone-50/95 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-900"
                >
                  {badgeLabel}
                </Badge>
              ) : null}
            </div>

            <div className="space-y-3">
              <h3 className="line-clamp-3 max-w-xs break-words font-heading text-3xl font-semibold text-stone-950 [text-shadow:0_1px_0_rgba(255,255,255,0.5)]">
                {product.name}
              </h3>
            </div>
          </div>
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-5 p-6">
        <Link href={productHref} className="block space-y-3">
          <p className="line-clamp-3 break-words text-sm leading-7 text-muted-foreground transition group-hover:text-foreground/80">
            {product.shortDescription}
          </p>
        </Link>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(product.price)}
              </p>
              {product.compareAtPrice ? (
                <div className="mt-0.5 flex items-center gap-2">
                  <p className="text-sm text-muted-foreground line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </p>
                </div>
              ) : null}
            </div>
            <Link
              href={productHref}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary/80"
            >
              Zobacz
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
            fullWidth={priority === "featured" || priority === "default"}
          />
        </div>
      </div>
    </article>
  );
}

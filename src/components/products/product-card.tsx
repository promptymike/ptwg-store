import Link from "next/link";
import { ArrowUpRight, BookOpen, CheckCircle2 } from "lucide-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getCoverImageOverlayOpacity } from "@/lib/product";
import { type Product } from "@/types/store";

type ProductCardProps = {
  product: Product;
  priority?: "default" | "featured";
  isOwned?: boolean;
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
  isOwned = false,
}: ProductCardProps) {
  const badgeLabel = getBadgeLabel(product);
  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const productHref = `/produkty/${product.slug}`;
  const coverOverlayOpacity = getCoverImageOverlayOpacity(product);

  return (
    <article className="surface-panel group flex h-full flex-col overflow-hidden transition duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_70px_-30px_rgba(0,0,0,0.5)]">
      <Link href={productHref} className="block" aria-label={`Zobacz produkt: ${product.name}`}>
        <div
          className={`relative min-h-64 overflow-hidden border-b border-border/70 bg-gradient-to-br ${product.coverGradient} p-6 transition duration-500 group-hover:brightness-105`}
        >
          {/* Decorative orbs only when there's no cover image — once a real
              cover is uploaded we let the artwork speak instead of stacking
              orbs on top of it. */}
          {!product.coverImageUrl ? (
            <>
              <div className="hero-orb right-5 top-5 size-20 bg-white/35 transition duration-700 group-hover:bg-white/45" />
              <div className="hero-orb bottom-6 left-6 size-16 bg-primary/18 transition duration-700 group-hover:bg-primary/30" />
            </>
          ) : null}

          {product.coverImageUrl && coverOverlayOpacity > 0 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              style={{
                backgroundImage: `url(${product.coverImageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                opacity: coverOverlayOpacity,
              }}
            />
          ) : null}

          {/* Title-contrast overlay tuned per state: stronger when a real
              cover is present so the title cleanly reads against any photo,
              softer over the stylised gradient so it doesn't muddy the
              pastel palette. */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-0 ${
              product.coverImageUrl
                ? "h-1/2 bg-gradient-to-t from-stone-950/55 via-stone-950/15 to-transparent"
                : "h-1/2 bg-gradient-to-t from-stone-950/20 via-stone-950/5 to-transparent"
            }`}
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
              {isOwned ? (
                <Badge
                  variant="outline"
                  className="border-emerald-700/30 bg-emerald-50/95 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900"
                >
                  <CheckCircle2 className="mr-1 size-3" />
                  W bibliotece
                </Badge>
              ) : badgeLabel ? (
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
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-primary transition hover:text-primary/80"
            >
              Zobacz
              <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          {isOwned ? (
            <Button
              size="lg"
              className="w-full"
              render={
                <Link
                  href={`/api/library/${product.id}/read`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <BookOpen className="size-4" />
              Otwórz w bibliotece
            </Button>
          ) : (
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
          )}
        </div>
      </div>
    </article>
  );
}

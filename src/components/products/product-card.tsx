import Link from "next/link";
import { ArrowUpRight, BookOpen, CheckCircle2, Sparkles } from "lucide-react";

import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { WishlistButton } from "@/components/products/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ViewTransition } from "@/components/ui/view-transition";
import { formatCurrency } from "@/lib/format";
import { getCoverImageOverlayOpacity } from "@/lib/product";
import { getInteractivePlanner, getProductHref } from "@/data/interactive-planners";
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

  const productHref = getProductHref(product.slug);
  const interactivePlanner = getInteractivePlanner(product.slug);
  const coverOverlayOpacity = getCoverImageOverlayOpacity(product);
  // Real uploaded covers come from supabase storage (full https URL). The
  // dynamic API fallback (/api/produkty/{slug}/cover) is intentionally a
  // title-empty mockup that needs the storefront <h3> overlay on top.
  // Real artwork ALREADY has the book title baked in, so we drop the overlay
  // there to avoid the double-title look users complained about.
  const isUploadedCover = Boolean(product.hasUploadedCover);

  return (
    <article className="surface-panel group flex h-full flex-col overflow-hidden transition duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_70px_-30px_rgba(0,0,0,0.5)]">
      <Link href={productHref} className="block" aria-label={`Zobacz produkt: ${product.name}`}>
        {/* Shared-element morph: the card cover flies into the product-page
            hero (same name in produkty/[slug]/page.tsx). */}
        <ViewTransition name={`product-cover-${product.id}`} share="morph" default="none">
        <div
          className={`relative min-h-64 overflow-hidden border-b border-border/70 ${
            isUploadedCover
              ? "bg-stone-100"
              : `bg-gradient-to-br ${product.coverGradient}`
          } p-6 transition duration-500 group-hover:brightness-105`}
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

          {product.coverImageUrl && (isUploadedCover || coverOverlayOpacity > 0) ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              style={{
                backgroundImage: `url(${product.coverImageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                // Uploaded covers should be the thumbnail, full strength. The
                // admin-tunable opacity only applies to the dynamic-fallback
                // case, where the cover blends with the brand gradient.
                opacity: isUploadedCover ? 1 : coverOverlayOpacity,
              }}
            />
          ) : null}

          {/* Title-contrast overlay only when we actually render a title on
              top of the cover. Uploaded artwork has the title baked in, so
              the dim overlay is just visual noise there. */}
          {!isUploadedCover ? (
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-x-0 bottom-0 ${
                product.coverImageUrl
                  ? "h-1/2 bg-gradient-to-t from-stone-950/55 via-stone-950/15 to-transparent"
                  : "h-1/2 bg-gradient-to-t from-stone-950/20 via-stone-950/5 to-transparent"
              }`}
            />
          ) : null}

          {!isOwned ? (
            <div className="absolute right-3 top-3 z-10">
              <WishlistButton productId={product.id} productName={product.name} />
            </div>
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

            {isUploadedCover ? (
              <h3 className="sr-only">{product.name}</h3>
            ) : (
              <div className="space-y-3">
                <h3 className="line-clamp-3 max-w-xs break-words font-heading text-3xl font-semibold text-stone-950 [text-shadow:0_1px_0_rgba(255,255,255,0.5)]">
                  {product.name}
                </h3>
              </div>
            )}
          </div>
        </div>
        </ViewTransition>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-5 p-6">
        <Link href={productHref} className="block min-h-10 space-y-3">
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
                  href={interactivePlanner ? `/narzedzia/${product.slug}` : `/api/library/${product.id}/read`}
                  target={interactivePlanner ? undefined : "_blank"}
                  rel={interactivePlanner ? undefined : "noopener noreferrer"}
                />
              }
            >
              {interactivePlanner ? <Sparkles className="size-4" /> : <BookOpen className="size-4" />}
              {interactivePlanner ? "Otwórz planer" : "Otwórz w bibliotece"}
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

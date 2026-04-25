"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, BookOpen, Heart, ShoppingBag } from "lucide-react";

import {
  type CartProductSnapshot,
  useCart,
} from "@/components/cart/cart-provider";
import { useWishlistSnapshot } from "@/components/products/wishlist-button";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getCoverImageOverlayOpacity } from "@/lib/product";
import { writeWishlist } from "@/lib/wishlist";

type SlimProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  price: number;
  coverGradient: string;
  coverImageUrl?: string | null;
  coverImageOpacity?: number | null;
  isOwned: boolean;
};

type WishlistViewProps = {
  products: SlimProduct[];
};

export function WishlistView({ products }: WishlistViewProps) {
  const wishlist = useWishlistSnapshot();
  const { addItem } = useCart();

  const items = useMemo(() => {
    const order = new Map(wishlist.map((entry, idx) => [entry.productId, idx]));
    return products
      .filter((p) => order.has(p.id))
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }, [wishlist, products]);

  function toCartSnapshot(product: SlimProduct): CartProductSnapshot {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      shortDescription: product.shortDescription,
      price: product.price,
      coverGradient: product.coverGradient,
    };
  }

  function handleAddAll() {
    for (const product of items) {
      if (!product.isOwned) addItem(toCartSnapshot(product));
    }
  }

  function handleClear() {
    writeWishlist([]);
  }

  if (wishlist.length === 0 || items.length === 0) {
    return (
      <div className="surface-panel space-y-3 p-8 text-center">
        <Heart className="mx-auto size-10 text-rose-500/60" />
        <h2 className="text-2xl text-foreground">Lista jest pusta</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Klikaj serduszko na karcie produktu, by tu zapisywać ebooki na
          później. Lista jest w przeglądarce — nie wymaga konta.
        </p>
        <div className="flex justify-center pt-2">
          <Button render={<Link href="/produkty" />}>
            Przeglądaj katalog
          </Button>
        </div>
      </div>
    );
  }

  const buyableCount = items.filter((p) => !p.isOwned).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "produkt" : "produktów"} na liście
          {buyableCount < items.length
            ? ` (${items.length - buyableCount} masz już w bibliotece)`
            : ""}
          .
        </p>
        <div className="flex flex-wrap gap-2">
          {buyableCount > 0 ? (
            <Button onClick={handleAddAll}>
              <ShoppingBag className="size-4" />
              Dodaj {buyableCount} do koszyka
            </Button>
          ) : null}
          <Button variant="ghost" onClick={handleClear}>
            Wyczyść listę
          </Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((product) => {
          const overlay = getCoverImageOverlayOpacity({
            coverImageOpacity: product.coverImageOpacity ?? undefined,
          });
          return (
            <article
              key={product.id}
              className="surface-panel group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <Link
                href={`/produkty/${product.slug}`}
                className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${product.coverGradient}`}
              >
                {product.coverImageUrl && overlay > 0 ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${product.coverImageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: overlay,
                    }}
                  />
                ) : null}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-950/45 via-stone-950/10 to-transparent"
                />
                <div className="relative flex h-full flex-col justify-between p-4">
                  <span className="self-start rounded-full bg-stone-950/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-50">
                    {product.category}
                  </span>
                  <p className="line-clamp-2 break-words font-heading text-xl font-semibold text-stone-950 [text-shadow:0_1px_0_rgba(255,255,255,0.5)]">
                    {product.name}
                  </p>
                </div>
              </Link>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
                  {product.shortDescription}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-foreground">
                    {formatCurrency(product.price)}
                  </p>
                  {product.isOwned ? (
                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <a
                          href={`/api/library/${product.id}/read`}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                    >
                      <BookOpen className="size-3.5" />
                      Otwórz
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => addItem(toCartSnapshot(product))}
                    >
                      <ShoppingBag className="size-3.5" />
                      Do koszyka
                    </Button>
                  )}
                </div>
                <Link
                  href={`/produkty/${product.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-primary"
                >
                  Zobacz produkt
                  <ArrowUpRight className="size-3" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowUpRight, Heart, ShoppingBag } from "lucide-react";

import {
  type CartProductSnapshot,
  useCart,
} from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getCoverImageOverlayOpacity } from "@/lib/product";
import { readWishlist, writeWishlist } from "@/lib/wishlist";

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

type WishlistSharedViewProps = {
  products: SlimProduct[];
};

export function WishlistSharedView({ products }: WishlistSharedViewProps) {
  const { addItem } = useCart();

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

  function addToOwnWishlist(productId: string) {
    const current = readWishlist();
    if (current.some((entry) => entry.productId === productId)) return;
    writeWishlist([
      ...current,
      { productId, addedAt: new Date().toISOString() },
    ]);
  }

  if (products.length === 0) {
    return (
      <div className="surface-panel space-y-3 p-8 text-center">
        <Heart className="mx-auto size-10 text-rose-500/60" />
        <h2 className="text-2xl text-foreground">Lista jest pusta</h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Link do listy nie zawiera już dostępnych produktów. Mogły zostać
          usunięte z katalogu.
        </p>
        <div className="flex justify-center pt-2">
          <Button render={<Link href="/lista-zyczen" />}>
            Otwórz swoją listę
          </Button>
        </div>
      </div>
    );
  }

  const totalPrice = products
    .filter((p) => !p.isOwned)
    .reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="space-y-6">
      <div className="surface-panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "produkt" : "produktów"} na
          udostępnionej liście. Łączna wartość:{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(totalPrice)}
          </span>
        </p>
        <Button render={<Link href="/lista-zyczen" />}>
          <Heart className="size-4" />
          Otwórz swoją listę
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
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
                <p className="text-base font-semibold text-foreground">
                  {formatCurrency(product.price)}
                </p>
                <div className="mt-auto flex flex-wrap gap-2">
                  {product.isOwned ? (
                    <Button
                      size="sm"
                      variant="outline"
                      render={<Link href="/biblioteka" />}
                    >
                      W bibliotece
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        onClick={() => addItem(toCartSnapshot(product))}
                      >
                        <ShoppingBag className="size-3.5" />
                        Do koszyka
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToOwnWishlist(product.id)}
                      >
                        <Heart className="size-3.5" />
                        Na moją listę
                      </Button>
                    </>
                  )}
                </div>
                <Link
                  href={`/produkty/${product.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-primary"
                >
                  Szczegóły produktu
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

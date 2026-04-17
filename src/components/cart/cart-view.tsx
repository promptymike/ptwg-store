"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

export function CartView() {
  const { items, isReady, subtotal, removeItem, updateQuantity } = useCart();

  if (!isReady) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="surface-panel h-56 animate-pulse border-border/70 bg-primary/6"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        badge="Koszyk"
        title="Twój koszyk jest jeszcze pusty"
        description="Dodaj pierwszy produkt cyfrowy i przejdź do Stripe Checkout. Stan koszyka zapisuje się lokalnie w localStorage."
        action={{ href: "/produkty", label: "Przeglądaj produkty" }}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        {items.map((item) => {
          const product = item.product;

          if (!product) {
            return (
              <article
                key={item.productId}
                className="surface-panel flex flex-col gap-4 p-6"
              >
                <div>
                  <p className="text-lg text-foreground">Produkt wymaga ponownego dodania</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ten wpis pochodzi ze starszej wersji koszyka i nie ma już pełnych danych
                    podglądu. Usuń go i dodaj produkt ponownie z katalogu.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.productId)}
                    aria-label="Usuń produkt"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                  <Button variant="outline" render={<Link href="/produkty" />}>
                    Wróć do katalogu
                  </Button>
                </div>
              </article>
            );
          }

          return (
            <article
              key={item.productId}
              className="surface-panel flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-28 w-24 rounded-[1.4rem] border border-border/70 bg-gradient-to-br ${product.coverGradient}`}
                />
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
                    {product.category}
                  </p>
                  <Link
                    href={`/produkty/${product.slug}`}
                    className="text-2xl text-foreground transition hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  <p className="max-w-xl text-sm text-muted-foreground">
                    {product.shortDescription}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-2 py-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    aria-label="Zmniejsz ilość"
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="min-w-8 text-center text-sm text-foreground">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    aria-label="Zwiększ ilość"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeItem(item.productId)}
                  aria-label="Usuń produkt"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="surface-panel h-fit space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
            Podsumowanie
          </p>
          <h2 className="text-3xl text-foreground">Gotowe do checkoutu</h2>
          <p className="text-sm text-muted-foreground">
            Zamówienie przejdzie teraz przez prawdziwy Stripe Checkout i po płatności trafi od
            razu do biblioteki klienta.
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Suma produktów</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-base font-semibold text-foreground">
            <span>Łącznie</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>

        <Button className="w-full" size="lg" render={<Link href="/checkout" />}>
          Przejdź do checkoutu
        </Button>
      </aside>
    </div>
  );
}

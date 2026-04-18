"use client";

import Link from "next/link";
import { Minus, Plus, ShieldCheck, Trash2, Zap } from "lucide-react";

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
        description="Dodaj pierwszy szablon i przejdź do bezpiecznej płatności. Pliki pojawią się w Twojej bibliotece natychmiast po zakupie."
        action={{ href: "/produkty", label: "Przeglądaj katalog" }}
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
                  <p className="text-lg text-foreground">Ten produkt wymaga ponownego dodania</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Wpis pochodzi ze starszej wersji koszyka i nie zawiera już pełnych danych.
                    Usuń go i dodaj produkt ponownie z katalogu.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(item.productId)}
                    aria-label="Usuń produkt z koszyka"
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
                  aria-label="Usuń produkt z koszyka"
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
            Podsumowanie zamówienia
          </p>
          <h2 className="text-3xl text-foreground">Wszystko gotowe do zakupu</h2>
          <p className="text-sm text-muted-foreground">
            Produkty pojawią się w Twojej bibliotece natychmiast po zaksięgowaniu płatności.
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Suma produktów</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3 text-base font-semibold text-foreground">
            <span>Łącznie</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Cena zawiera podatek. Fakturę VAT wystawiamy automatycznie po zakupie.
          </p>
        </div>

        <Button className="w-full" size="lg" render={<Link href="/checkout" />}>
          Przejdź do płatności
        </Button>

        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 text-primary" />
            Bezpieczne płatności online — karta, BLIK, Apple Pay.
          </li>
          <li className="flex items-start gap-2">
            <Zap className="mt-0.5 size-4 text-primary" />
            Natychmiastowy dostęp do plików po zakupie.
          </li>
        </ul>
      </aside>
    </div>
  );
}

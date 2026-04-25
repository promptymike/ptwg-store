"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";

import {
  type CartProductSnapshot,
  useCart,
} from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

type MiniCartProps = {
  open: boolean;
  onClose: () => void;
};

type Recommendation = CartProductSnapshot;

export function MiniCart({ open, onClose }: MiniCartProps) {
  const { items, subtotal, totalItems, removeItem, updateQuantity, addItem } =
    useCart();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const cartProductIds = useMemo(
    () => items.map((line) => line.productId).join(","),
    [items],
  );

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  // Pull cart-aware upsell suggestions whenever the panel opens or the
  // cart contents change. Server-side filter keeps owned products out so
  // the buyer never sees "dorzuć" for something already in their library.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const params = cartProductIds ? `?ids=${encodeURIComponent(cartProductIds)}` : "";
    fetch(`/api/cart/recommendations${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        setRecommendations(
          Array.isArray(data?.items) ? (data.items as Recommendation[]) : [],
        );
      })
      .catch(() => {
        if (!cancelled) setRecommendations([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, cartProductIds]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-label="Mini koszyk"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border/60 bg-card shadow-[0_0_60px_-10px_rgba(0,0,0,0.4)] animate-in slide-in-from-right duration-300"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShoppingBag className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Twój koszyk</p>
              <p className="text-xs text-muted-foreground">
                {totalItems === 0
                  ? "Brak produktów"
                  : totalItems === 1
                    ? "1 produkt"
                    : `${totalItems} produkty`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij koszyk"
            className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="inline-flex size-16 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground">
                <ShoppingBag className="size-7" />
              </span>
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  Twój koszyk jest jeszcze pusty
                </p>
                <p className="text-sm text-muted-foreground">
                  Wybierz coś z katalogu — wszystkie produkty są cyfrowe i trafią
                  do biblioteki natychmiast po zakupie.
                </p>
              </div>
              <Button render={<Link href="/produkty" onClick={onClose} />}>
                Przeglądaj katalog
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((line) => {
                const product = line.product;
                if (!product) return null;
                return (
                  <li
                    key={line.productId}
                    className="flex gap-3 rounded-2xl border border-border/70 bg-background/60 p-3"
                  >
                    <Link
                      href={`/produkty/${product.slug}`}
                      onClick={onClose}
                      aria-label={product.name}
                      className={`relative size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${product.coverGradient}`}
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-950/40 to-transparent"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/produkty/${product.slug}`}
                          onClick={onClose}
                          className="line-clamp-2 break-words text-sm font-semibold text-foreground transition hover:text-primary"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(line.productId)}
                          aria-label={`Usuń ${product.name}`}
                          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/80 p-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(line.productId, line.quantity - 1)
                            }
                            aria-label="Zmniejsz ilość"
                            className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm font-semibold text-foreground tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(line.productId, line.quantity + 1)
                            }
                            aria-label="Zwiększ ilość"
                            className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-foreground tabular-nums">
                          {formatCurrency(product.price * line.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && recommendations.length > 0 ? (
          <div className="border-t border-border/60 bg-background/30 px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-3.5 text-primary" />
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary/80">
                Możesz dorzucić
              </p>
            </div>
            <ul className="space-y-2">
              {recommendations.map((product) => (
                <li
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-3 py-2"
                >
                  <Link
                    href={`/produkty/${product.slug}`}
                    onClick={onClose}
                    aria-label={product.name}
                    className={`relative size-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${product.coverGradient}`}
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produkty/${product.slug}`}
                      onClick={onClose}
                      className="line-clamp-1 break-words text-sm font-semibold text-foreground transition hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addItem(product)}
                    aria-label={`Dorzuć ${product.name}`}
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground"
                  >
                    <Plus className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {items.length > 0 ? (
          <footer className="space-y-3 border-t border-border/60 bg-background/40 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Suma</span>
              <span className="text-lg font-semibold text-foreground tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ceny brutto, płatność Stripe. Faktury i potwierdzenia przyjdą na
              e-mail.
            </p>
            <div className="flex flex-col gap-2">
              <Button render={<Link href="/checkout" onClick={onClose} />}>
                Przejdź do kasy
              </Button>
              <Button
                variant="outline"
                render={<Link href="/koszyk" onClick={onClose} />}
              >
                Otwórz pełny koszyk
              </Button>
            </div>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

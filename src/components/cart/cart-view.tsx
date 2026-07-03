"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PURCHASES_ENABLED,
  PURCHASES_UNAVAILABLE_MESSAGE,
} from "@/lib/purchase-availability";
import { formatCurrency } from "@/lib/format";
import {
  clearStoredPromoCode,
  getStoredPromoCode,
  setStoredPromoCode,
} from "@/lib/promo-code-storage";
import { getProductHref } from "@/data/interactive-planners";

type AppliedPromo = {
  code: string;
  label: string;
  percentOff: number;
};

export function CartView() {
  const { items, isReady, subtotal, removeItem, updateQuantity } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const restoredPromoRef = useRef(false);

  async function validatePromoCode(code: string, silent = false) {
    setPromoBusy(true);
    if (!silent) setPromoMessage(null);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        label?: string;
        percentOff?: number;
        message?: string;
      } | null;

      if (!response.ok || !data?.ok || !data.code || !data.percentOff) {
        setPromo(null);
        clearStoredPromoCode();
        if (!silent) {
          setPromoMessage(data?.message ?? "Ten kod nie działa albo wygasł.");
        }
        return;
      }

      setPromo({
        code: data.code,
        label: data.label ?? `Kod ${data.code}`,
        percentOff: data.percentOff,
      });
      setStoredPromoCode(data.code);
      setPromoMessage(silent ? null : `Zastosowano: ${data.label ?? data.code}`);
    } catch {
      if (!silent) {
        setPromoMessage("Nie udało się sprawdzić kodu. Spróbuj ponownie.");
      }
    } finally {
      setPromoBusy(false);
    }
  }

  // Restore a code applied earlier (this or a previous visit) so the buyer
  // doesn't have to re-type it after coming back from the promo strip.
  useEffect(() => {
    if (!isReady || restoredPromoRef.current) return;
    restoredPromoRef.current = true;
    const stored = getStoredPromoCode();
    if (stored && items.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe post-mount read of localStorage
      setPromoInput(stored);
      void validatePromoCode(stored, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot restore after hydration
  }, [isReady]);

  function handleRemovePromo() {
    setPromo(null);
    setPromoInput("");
    setPromoMessage(null);
    clearStoredPromoCode();
  }

  const promoDiscount = promo
    ? Math.round(subtotal * (promo.percentOff / 100))
    : 0;
  const totalAfterPromo = Math.max(subtotal - promoDiscount, 0);

  if (!isReady) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
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
        icon={ShoppingBag}
        badge="Koszyk"
        title="Twój koszyk jest jeszcze pusty"
        description="Dodaj pierwszy ebook i przejdź do bezpiecznej płatności. Pliki pojawią się w Twojej bibliotece natychmiast po zakupie."
        action={{ href: "/produkty", label: "Przeglądaj katalog" }}
        secondaryAction={{ href: "/test", label: "Zrób test dopasowania" }}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="min-w-0 space-y-4">
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
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div
                  className={`h-28 w-24 shrink-0 rounded-[1.4rem] border border-border/70 bg-gradient-to-br ${product.coverGradient}`}
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
                    {product.category}
                  </p>
                  <Link
                    href={getProductHref(product.slug)}
                    className="block text-2xl text-foreground transition hover:text-primary line-clamp-2 break-words"
                  >
                    {product.name}
                  </Link>
                  <p className="line-clamp-2 break-words text-sm text-muted-foreground">
                    {product.shortDescription}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(product.price)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
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

        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Tag className="size-3.5 text-primary" />
            Kod rabatowy
          </p>
          {promo ? (
            <div className="flex items-center justify-between gap-2 rounded-[1.1rem] border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm">
              <span className="font-semibold text-foreground">
                {promo.code} · −{promo.percentOff}%
              </span>
              <button
                type="button"
                onClick={handleRemovePromo}
                aria-label="Usuń kod rabatowy"
                className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background/80 hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={promoInput}
                onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                placeholder="np. TEMPLIFY15"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (!promoBusy && promoInput.trim()) {
                      void validatePromoCode(promoInput.trim());
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => void validatePromoCode(promoInput.trim())}
                disabled={promoBusy || !promoInput.trim()}
              >
                {promoBusy ? <Loader2 className="size-4 animate-spin" /> : "Zastosuj"}
              </Button>
            </div>
          )}
          {promoMessage ? (
            <p
              className={`text-xs ${promo ? "text-primary" : "text-destructive"}`}
              role="status"
              aria-live="polite"
            >
              {promoMessage}
            </p>
          ) : null}
        </div>

        <div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Suma produktów</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {promo ? (
            <div className="mt-2 flex items-center justify-between text-sm text-primary">
              <span>
                {promo.code} (−{promo.percentOff}%)
              </span>
              <span>−{formatCurrency(promoDiscount)}</span>
            </div>
          ) : null}
          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3 text-base font-semibold text-foreground">
            <span>Łącznie</span>
            <span>{formatCurrency(totalAfterPromo)}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Cena zawiera podatek. Fakturę VAT wystawiamy automatycznie po zakupie.
          </p>
        </div>

        {PURCHASES_ENABLED ? (
          <Button className="w-full" size="lg" render={<Link href="/checkout" />}>
            Przejdź do płatności
          </Button>
        ) : (
          <div className="space-y-2">
            <Button className="w-full" size="lg" disabled>
              Zakupy chwilowo niedostępne
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">
              {PURCHASES_UNAVAILABLE_MESSAGE}
            </p>
          </div>
        )}

        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-4 text-primary" />
            Bezpieczne płatności kartą obsługiwane przez Stripe.
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

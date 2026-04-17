"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProductById } from "@/data/mock-store";
import { formatCurrency } from "@/lib/format";

type CheckoutResponse = {
  orderId: string;
  status: string;
  message: string;
};

export function CheckoutClient() {
  const { items, subtotal, clearCart, isReady } = useCart();
  const [email, setEmail] = useState("klientka@ptwg.pl");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CheckoutResponse | null>(null);
  const lines = useMemo(
    () =>
      items
        .map((item) => {
          const product = getProductById(item.productId);
          if (!product) {
            return null;
          }

          return { ...product, quantity: item.quantity };
        })
        .filter(Boolean),
    [items],
  );

  async function handleCheckout() {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(data.message);
      }

      setResult(data);
      clearCart();
    } catch (error) {
      setResult({
        orderId: "BRAK",
        status: "Błąd",
        message:
          error instanceof Error
            ? error.message
            : "Nie udało się uruchomić mock checkoutu.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return <div className="surface-panel h-80 animate-pulse bg-primary/5" />;
  }

  if (lines.length === 0 && !result) {
    return (
      <EmptyState
        badge="Checkout"
        title="Najpierw dodaj coś do koszyka"
        description="Mock checkout wymaga co najmniej jednego produktu. Po integracji ze Stripe ta sekcja będzie generować prawdziwą sesję płatności."
        action={{ href: "/produkty", label: "Przejdź do katalogu" }}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="surface-panel gold-frame space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <span className="eyebrow">Mock checkout</span>
          <div>
            <h1 className="text-4xl text-white sm:text-5xl">
              Finalizacja zamówienia
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Strona symuluje checkout i waliduje payload przez Zod w route
              handlerze. To miejsce jest gotowe do podmiany na Stripe Checkout.
            </p>
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-white">E-mail zamówienia</span>
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="twoj@email.pl"
            type="email"
          />
        </label>

        <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-secondary/45 p-5">
          <p className="text-sm font-medium text-white">Co wydarzy się po integracji</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>W tym miejscu powstanie sesja Stripe Checkout.</li>
            <li>Po płatności zamówienie trafi do bazy Supabase.</li>
            <li>Produkt pojawi się automatycznie w bibliotece użytkownika.</li>
          </ul>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={isSubmitting || lines.length === 0}
        >
          {isSubmitting ? "Uruchamianie mock checkoutu..." : "Potwierdź zamówienie testowe"}
        </Button>

        {result ? (
          <div className="rounded-[1.5rem] border border-primary/25 bg-primary/10 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-primary/80">
              {result.status}
            </p>
            <p className="mt-2 text-xl text-white">Numer: {result.orderId}</p>
            <p className="mt-2 text-sm text-muted-foreground">{result.message}</p>
            <Link href="/biblioteka" className="mt-4 inline-block text-sm text-primary">
              Zobacz placeholder biblioteki
            </Link>
          </div>
        ) : null}
      </section>

      <aside className="surface-panel gold-frame h-fit space-y-4 p-6">
        <h2 className="text-2xl text-white">Podsumowanie</h2>
        <div className="space-y-3">
          {lines.map((line) =>
            line ? (
              <div
                key={line.id}
                className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-border/60 bg-secondary/45 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-white">{line.name}</p>
                  <p className="text-muted-foreground">Ilość: {line.quantity}</p>
                </div>
                <span className="text-white">
                  {formatCurrency(line.price * line.quantity)}
                </span>
              </div>
            ) : null,
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-base font-semibold text-white">
          <span>Łącznie</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}

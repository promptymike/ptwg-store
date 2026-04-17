"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMissingStripeCheckoutEnv } from "@/lib/env";
import { formatCurrency } from "@/lib/format";

type CheckoutResponse = {
  url?: string;
  message?: string;
};

type CheckoutClientProps = {
  initialEmail: string;
};

export function CheckoutClient({ initialEmail }: CheckoutClientProps) {
  const { items, subtotal, isReady } = useCart();
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lines = useMemo(
    () =>
      items
        .map((item) =>
          item.product ? { ...item.product, quantity: item.quantity } : null,
        )
        .filter(Boolean),
    [items],
  );

  async function handleCheckout() {
    setIsSubmitting(true);
    setErrorMessage(null);

    const missingEnv = getMissingStripeCheckoutEnv();

    if (missingEnv.length > 0) {
      setErrorMessage(`Brakuje konfiguracji Stripe: ${missingEnv.join(", ")}.`);
      setIsSubmitting(false);
      return;
    }

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

      if (!response.ok || !data.url) {
        throw new Error(
          data.message ?? "Nie udało się utworzyć sesji Stripe Checkout.",
        );
      }

      window.location.assign(data.url);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się uruchomić Stripe Checkout.",
      );
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return <div className="surface-panel h-80 animate-pulse bg-primary/5" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        badge="Checkout"
        title="Najpierw dodaj coś do koszyka"
        description="Stripe Checkout wymaga co najmniej jednego produktu. Dodaj produkt do koszyka i wróć tutaj, aby przejść do płatności."
        action={{ href: "/produkty", label: "Przejdź do katalogu" }}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <span className="eyebrow">Stripe Checkout</span>
          <div>
            <h1 className="text-4xl text-foreground sm:text-5xl">
              Finalizacja zamówienia
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Po kliknięciu przycisku utworzymy prawdziwą sesję Stripe Checkout na podstawie
              produktów z Supabase i przeniesiemy Cię do płatności.
            </p>
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">E-mail zamówienia</span>
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="twoj@email.pl"
            type="email"
          />
        </label>

        <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
          <p className="text-sm font-medium text-foreground">Co wydarzy się po płatności</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Stripe otworzy bezpieczną stronę płatności dla Twojego koszyka.</li>
            <li>Zamówienie zapisze się w Supabase po webhooku `checkout.session.completed`.</li>
            <li>Produkty trafią automatycznie do biblioteki Twojego konta.</li>
          </ul>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={isSubmitting || lines.length === 0}
        >
          {isSubmitting ? "Przekierowanie do Stripe..." : "Przejdź do płatności"}
        </Button>

        {errorMessage ? (
          <div className="rounded-[1.5rem] border border-destructive/30 bg-destructive/10 p-5 text-sm text-foreground">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <aside className="surface-panel h-fit space-y-4 p-6">
        <h2 className="text-2xl text-foreground">Podsumowanie</h2>
        <div className="space-y-3">
          {lines.map((line) =>
            line ? (
              <div
                key={line.id}
                className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-border/60 bg-background/70 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{line.name}</p>
                  <p className="text-muted-foreground">Ilość: {line.quantity}</p>
                </div>
                <span className="text-foreground">
                  {formatCurrency(line.price * line.quantity)}
                </span>
              </div>
            ) : null,
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-base font-semibold text-foreground">
          <span>Łącznie</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <Link href="/koszyk" className="text-sm text-primary transition hover:text-primary/80">
          Wróć do koszyka
        </Link>
      </aside>
    </div>
  );
}

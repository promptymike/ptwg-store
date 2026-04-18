"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Lock, ShieldCheck, Zap } from "lucide-react";

import { useAnalytics } from "@/components/analytics/analytics-provider";
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
  const { track } = useAnalytics();
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const trackedCheckoutRef = useRef(false);
  const lines = useMemo(
    () =>
      items
        .map((item) =>
          item.product ? { ...item.product, quantity: item.quantity } : null,
        )
        .filter(Boolean),
    [items],
  );

  useEffect(() => {
    if (!isReady || lines.length === 0 || trackedCheckoutRef.current) {
      return;
    }

    track("begin_checkout", {
      itemCount: lines.length,
      subtotal,
      items: lines.map((line) =>
        line
          ? {
              productId: line.id,
              slug: line.slug,
              name: line.name,
              quantity: line.quantity,
              price: line.price,
            }
          : null,
      ),
    });

    trackedCheckoutRef.current = true;
  }, [isReady, lines, subtotal, track]);

  async function handleCheckout() {
    setIsSubmitting(true);
    setErrorMessage(null);

    const missingEnv = getMissingStripeCheckoutEnv();

    if (missingEnv.length > 0) {
      setErrorMessage(
        "Płatności są chwilowo niedostępne. Napisz do nas na kontakt@templify.store — pomożemy dokończyć zamówienie.",
      );
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
          data.message ?? "Nie udało się rozpocząć płatności. Spróbuj ponownie za chwilę.",
        );
      }

      window.location.assign(data.url);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się rozpocząć płatności. Spróbuj ponownie za chwilę.",
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
        badge="Płatność"
        title="Najpierw dodaj coś do koszyka"
        description="Żeby przejść do płatności, wybierz przynajmniej jeden szablon z katalogu. Zajmie Ci to chwilę."
        action={{ href: "/produkty", label: "Przeglądaj katalog" }}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <span className="eyebrow">Bezpieczna płatność</span>
          <div>
            <h1 className="text-4xl text-foreground sm:text-5xl">
              Finalizacja zamówienia
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Jeszcze tylko jeden krok. Po kliknięciu poniżej przejdziesz do bezpiecznej strony
              płatności. Dostęp do plików otrzymasz natychmiast po zakupie.
            </p>
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Adres e-mail do zamówienia</span>
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="twoj@email.pl"
            type="email"
          />
          <span className="block text-xs text-muted-foreground">
            Na ten adres wyślemy potwierdzenie zakupu i fakturę VAT.
          </span>
        </label>

        <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
          <p className="text-sm font-medium text-foreground">Co dzieje się po kliknięciu?</p>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Przejdziesz do bezpiecznej strony płatności — karta, BLIK lub Apple Pay.</li>
            <li>2. Po zapłaceniu zobaczysz potwierdzenie i numer zamówienia.</li>
            <li>3. Pliki pojawią się w Twojej bibliotece w Templify natychmiast po płatności.</li>
          </ol>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={isSubmitting || lines.length === 0}
        >
          {isSubmitting ? "Przekierowanie do płatności..." : "Przejdź do bezpiecznej płatności"}
        </Button>

        <ul className="grid gap-3 sm:grid-cols-3">
          <li className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lock className="mt-0.5 size-4 text-primary" />
            Szyfrowane połączenie SSL.
          </li>
          <li className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 text-primary" />
            14 dni na zwrot bez pytań.
          </li>
          <li className="flex items-start gap-2 text-xs text-muted-foreground">
            <Zap className="mt-0.5 size-4 text-primary" />
            Dostęp do plików natychmiast.
          </li>
        </ul>

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
        <p className="text-xs text-muted-foreground">
          Cena zawiera podatek. Fakturę VAT wyślemy na adres e-mail z zamówienia.
        </p>
        <Link href="/koszyk" className="inline-flex text-sm text-primary transition hover:text-primary/80">
          ← Wróć do koszyka
        </Link>
      </aside>
    </div>
  );
}

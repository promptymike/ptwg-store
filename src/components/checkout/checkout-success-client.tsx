"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

import { useAnalytics } from "@/components/analytics/analytics-provider";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

type CheckoutSuccessClientProps = {
  orderId: string;
  amount: string;
  email: string;
  itemCount: number;
};

export function CheckoutSuccessClient({
  orderId,
  amount,
  email,
  itemCount,
}: CheckoutSuccessClientProps) {
  const { clearCart } = useCart();
  const { track } = useAnalytics();
  const clearedRef = useRef(false);
  const trackedPurchaseRef = useRef(false);

  useEffect(() => {
    if (clearedRef.current) {
      return;
    }

    clearCart();
    clearedRef.current = true;
  }, [clearCart]);

  useEffect(() => {
    if (trackedPurchaseRef.current) {
      return;
    }

    track("purchase", {
      orderId,
      amount,
      email,
      itemCount,
    });

    trackedPurchaseRef.current = true;
  }, [amount, email, itemCount, orderId, track]);

  return (
    <section className="surface-panel space-y-6 p-6 sm:p-8">
      <div className="space-y-3">
        <span className="eyebrow">Płatność zakończona</span>
        <div>
          <h1 className="text-4xl text-foreground sm:text-5xl">Dziękujemy za zakup</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Zamówienie zostało zapisane, a produkty trafiły do biblioteki. Fulfillment pozostaje
            idempotentny, więc ten sam event Stripe nie utworzy duplikatów.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Numer zamówienia</p>
          <p className="mt-3 text-lg text-foreground">{orderId}</p>
        </article>
        <article className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Kwota</p>
          <p className="mt-3 text-lg text-foreground">{amount}</p>
        </article>
        <article className="rounded-[1.4rem] border border-border/70 bg-background/70 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">Produkty</p>
          <p className="mt-3 text-lg text-foreground">{itemCount}</p>
        </article>
      </div>

      <div className="rounded-[1.4rem] border border-primary/20 bg-primary/10 p-5 text-sm text-muted-foreground">
        Potwierdzenie płatności zostało przypisane do konta z adresem{" "}
        <span className="text-foreground">{email}</span>.
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" render={<Link href="/biblioteka" />}>
          Otwórz bibliotekę
        </Button>
        <Button size="lg" variant="outline" render={<Link href="/konto" />}>
          Zobacz konto
        </Button>
      </div>
    </section>
  );
}

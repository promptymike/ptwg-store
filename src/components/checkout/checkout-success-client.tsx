"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

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
  const clearedRef = useRef(false);

  useEffect(() => {
    if (clearedRef.current) {
      return;
    }

    clearCart();
    clearedRef.current = true;
  }, [clearCart]);

  return (
    <section className="surface-panel gold-frame space-y-6 p-6 sm:p-8">
      <div className="space-y-3">
        <span className="eyebrow">Płatność zakończona</span>
        <div>
          <h1 className="text-4xl text-white sm:text-5xl">Dziękujemy za zakup</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Zamówienie zostało zapisane, a produkty trafiły do biblioteki.
            Jeśli webhook i strona sukcesu pojawiły się jednocześnie, fulfillment
            pozostał idempotentny i nie utworzył duplikatów.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[1.4rem] border border-border/70 bg-secondary/45 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
            Numer zamówienia
          </p>
          <p className="mt-3 text-lg text-white">{orderId}</p>
        </article>
        <article className="rounded-[1.4rem] border border-border/70 bg-secondary/45 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
            Kwota
          </p>
          <p className="mt-3 text-lg text-white">{amount}</p>
        </article>
        <article className="rounded-[1.4rem] border border-border/70 bg-secondary/45 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
            Produkty
          </p>
          <p className="mt-3 text-lg text-white">{itemCount}</p>
        </article>
      </div>

      <div className="rounded-[1.4rem] border border-primary/20 bg-primary/10 p-5 text-sm text-muted-foreground">
        Potwierdzenie płatności zostało przypisane do konta z adresem <span className="text-white">{email}</span>.
      </div>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" render={<Link href="/biblioteka" />}>
          Otwórz bibliotekę
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-primary/25 bg-secondary/45 text-white"
          render={<Link href="/konto" />}
        >
          Zobacz konto
        </Button>
      </div>
    </section>
  );
}

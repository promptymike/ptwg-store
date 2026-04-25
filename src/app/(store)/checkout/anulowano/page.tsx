import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Płatność anulowana",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutCancelPage() {
  return (
    <div className="shell section-space">
      <section className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <span className="eyebrow">Płatność anulowana</span>
          <div>
            <h1 className="text-4xl text-foreground sm:text-5xl">Zamówienie nie zostało opłacone</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Twój koszyk nadal czeka. Możesz wrócić do checkoutu, poprawić koszyk albo przejść
              ponownie do katalogu bez utraty aktualnego stanu.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" render={<Link href="/checkout" />}>
            Wróć do checkoutu
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/koszyk" />}>
            Zobacz koszyk
          </Button>
        </div>
      </section>
    </div>
  );
}

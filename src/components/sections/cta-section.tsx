import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="shell section-space pt-0">
      <div className="surface-panel gold-frame overflow-hidden p-6 sm:p-8 lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-4">
            <span className="eyebrow">CTA</span>
            <h2 className="text-4xl text-white sm:text-5xl">
              MVP jest gotowe, żeby przejść z makiety do prawdziwej sprzedaży.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Supabase Auth, admin CRUD, storage, biblioteka i Stripe Checkout
              są już spięte. Kolejny etap to rozwój automatyzacji, e-maili i bardziej
              rozbudowanego flow sprzedażowego.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="lg" render={<Link href="/admin" />}>
              Otwórz panel admina
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/checkout" />}>
              Przetestuj checkout
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

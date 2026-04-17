import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="shell section-space pt-0">
      <div className="surface-panel overflow-hidden p-6 sm:p-8 lg:p-12">
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
          <div className="space-y-4">
            <span className="eyebrow">Ready to convert</span>
            <h2 className="text-balance text-4xl text-foreground sm:text-5xl">
              Build trust faster with a storefront that feels polished before the customer clicks buy.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Templify already connects premium UI with real auth, storage, checkout and
              fulfillment. The next layer can focus on growth, not rebuilding foundations.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="lg" render={<Link href="/produkty" />}>
              Przeglądaj produkty
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/admin" />}>
              Otwórz panel admina
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="shell section-space pt-0">
      <div className="surface-panel overflow-hidden p-6 sm:p-8 lg:p-12">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] xl:items-center">
          <div className="space-y-4">
            <span className="eyebrow">Gotowy/a, by ogarnąć kawałek życia?</span>
            <h2 className="text-balance text-4xl text-foreground sm:text-5xl">
              Zacznij od jednego ebooka. Zmień jeden obszar życia.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Każdy ebook w Templify jest zaprojektowany pod realne wdrożenie — od pierwszego
              wieczoru. Natychmiastowy dostęp, 14 dni na zwrot, czytasz na telefonie, tablecie
              lub komputerze.
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4 text-primary" />
              Pytanie przed zakupem? Napisz na <span className="text-foreground">kontakt@templify.store</span>
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="lg" render={<Link href="/produkty" />}>
              Przeglądaj katalog
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/#bundles" />}>
              Zobacz pakiety
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

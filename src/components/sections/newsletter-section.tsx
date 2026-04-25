import { Sparkles } from "lucide-react";

import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="shell section-space">
      <div className="surface-panel relative overflow-hidden p-6 sm:p-10">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-72 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl"
        />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-4">
            <span className="eyebrow">
              <Sparkles className="size-3.5" />
              Newsletter Templify
            </span>
            <h2 className="text-3xl text-foreground sm:text-4xl">
              1 króciutki insight tygodniowo + bezpłatna próbka ebooka
            </h2>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Zostaw email — od razu dostaniesz link do bezpłatnej próbki naszego
              najtańszego ebooka. Potem raz w tygodniu krótka wskazówka o
              finansach, zdrowiu, czasie albo macierzyństwie. Zero spamu, zero
              ściemy. Wypisujesz się jednym kliknięciem.
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <li>· bez spamu</li>
              <li>· max 1 mail tygodniowo</li>
              <li>· -15% na pierwszy zakup</li>
            </ul>
          </div>
          <NewsletterForm source="home_hero" />
        </div>
      </div>
    </section>
  );
}

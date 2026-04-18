import { SectionHeading } from "@/components/shared/section-heading";
import type { SiteSectionContent } from "@/types/store";

const steps = [
  {
    step: "01",
    title: "Wybierz system",
    description:
      "Przeglądaj katalog po kategorii lub efekcie i wybierz szablon, który rozwiązuje Twój najbliższy problem.",
  },
  {
    step: "02",
    title: "Opłać bezpiecznie",
    description:
      "Przechodzisz przez bezpieczny checkout online. Płacisz kartą, BLIK-iem lub Apple Pay — jednym kliknięciem.",
  },
  {
    step: "03",
    title: "Otwórz bibliotekę",
    description:
      "Produkty pojawiają się w Twojej bibliotece natychmiast po płatności — bez czekania i ręcznego odbioru.",
  },
  {
    step: "04",
    title: "Wdrażaj od razu",
    description:
      "Pliki, systemy Notion i pakiety są tak zbudowane, by przyniosły efekt jeszcze tego samego dnia.",
  },
];

type HowItWorksSectionProps = {
  content: SiteSectionContent;
};

export function HowItWorksSection({
  content,
}: HowItWorksSectionProps) {
  return (
    <section className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge={content.eyebrow}
          title={content.title}
          description={content.description}
        />

        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.step} className="surface-panel p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
                {step.step}
              </p>
              <h3 className="mt-3 text-2xl text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{content.body}</p>
      </div>
    </section>
  );
}

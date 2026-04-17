import { SectionHeading } from "@/components/shared/section-heading";
import { testimonials } from "@/data/mock-store";

export function TestimonialsSection() {
  return (
    <section id="opinie" className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge="Opinie"
          title="Estetyka przyciąga, użyteczność zatrzymuje"
          description="W sekcji opinii pokazujemy klimat marki oraz dowód społeczny, nawet na etapie MVP i placeholderowych danych."
          align="center"
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="surface-panel gold-frame p-6">
              <p className="text-lg leading-8 text-white/92">“{testimonial.quote}”</p>
              <div className="mt-6 border-t border-border/60 pt-4">
                <p className="text-sm font-medium text-white">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-primary/75">
                  Ocena {testimonial.score}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

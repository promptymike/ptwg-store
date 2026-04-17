import { SectionHeading } from "@/components/shared/section-heading";
import type { Testimonial } from "@/types/store";

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
};

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section id="testimonials" className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge="Testimonials"
          title="Proof that the premium layer translates into real operational clarity"
          description="Opinie budują zaufanie, ale w Templify mają też pokazać konkretny efekt: mniej chaosu, szybsze wdrożenie, wyższy poziom marki."
          align="center"
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="surface-panel p-6">
              <p className="text-lg leading-8 text-foreground/90">“{testimonial.quote}”</p>
              <div className="mt-6 border-t border-border/60 pt-4">
                <p className="text-sm font-medium text-foreground">{testimonial.author}</p>
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

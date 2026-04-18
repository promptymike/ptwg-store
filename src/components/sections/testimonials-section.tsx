import { Star } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import type { Testimonial } from "@/types/store";

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
};

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge="Opinie klientów"
          title="Realne efekty, nie obietnice. Tak nasi klienci używają Templify."
          description="Mniej chaosu, szybsze wdrożenie, marka, która wygląda dojrzalej — to najczęściej powtarzane rzeczy po pierwszych tygodniach z naszymi szablonami."
          align="center"
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.id} className="surface-panel p-6">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="mt-4 text-lg leading-8 text-foreground/90">
                „{testimonial.quote}”
              </p>
              <div className="mt-6 border-t border-border/60 pt-4">
                <p className="text-sm font-medium text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Quote, Star } from "lucide-react";

import type { Testimonial } from "@/types/store";

type ProductTestimonialsProps = {
  testimonials: Testimonial[];
  productName: string;
};

export function ProductTestimonials({
  testimonials,
  productName,
}: ProductTestimonialsProps) {
  if (testimonials.length === 0) return null;

  const averageScore = (
    testimonials.reduce(
      (sum, item) => sum + Number.parseFloat(item.score ?? "5") || 5,
      0,
    ) / testimonials.length
  ).toFixed(1);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
            Opinie czytelniczek i czytelników
          </p>
          <h2 className="text-3xl text-foreground sm:text-4xl">
            Co mówią ludzie, którzy już kupili
          </h2>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 px-5 py-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                className={`size-4 ${idx < Math.round(Number.parseFloat(averageScore)) ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
              />
            ))}
          </div>
          <div className="text-sm">
            <span className="font-semibold text-foreground tabular-nums">
              {averageScore}
            </span>
            <span className="text-muted-foreground"> / 5 · {testimonials.length} opinii</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((item) => {
          const score = Number.parseFloat(item.score ?? "5") || 5;
          return (
            <article
              key={item.id}
              className="surface-panel relative flex h-full flex-col gap-4 p-6"
            >
              <Quote
                className="absolute right-5 top-5 size-8 text-primary/20"
                aria-hidden
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`size-3.5 ${idx < Math.round(score) ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                  />
                ))}
              </div>
              <p className="flex-1 text-sm leading-7 text-foreground">
                &bdquo;{item.quote}&rdquo;
              </p>
              <div className="border-t border-border/60 pt-3">
                <p className="text-sm font-semibold text-foreground">
                  {item.author}
                </p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Opinie pochodzą od czytelniczek i czytelników po zakupie produktów
        Templify (m.in. {productName}). Każda osoba potwierdziła autorstwo i
        zgodę na publikację.
      </p>
    </section>
  );
}

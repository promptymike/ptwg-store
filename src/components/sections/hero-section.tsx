"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { HeroCta } from "@/components/experiments/hero-cta";
import { formatCurrency } from "@/lib/format";
import type { Product, SiteSectionContent } from "@/types/store";

type HeroSectionProps = {
  content: SiteSectionContent;
  products: Product[];
};

// Muted, paper-warm tints for the editorial gallery plates. Each cover reads
// as an intentional magazine still rather than a screenshot — the real
// product photography drops straight into these frames later.
const COVER_TINTS = ["#e7ddcd", "#e4d8c6", "#e8dbd3", "#ece2d4", "#e2d6c6", "#e5d8d0"];

export function HeroSection({ content, products }: HeroSectionProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  // Magnetic CTA — the button leans toward the cursor as it approaches, the
  // small high-craft cue that signals "designed, not generated".
  useEffect(() => {
    const root = rootRef.current;
    const cta = ctaRef.current;
    if (!root || !cta) return;

    function handleMove(event: PointerEvent) {
      const rect = cta!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(event.clientX - cx, event.clientY - cy);
      cta!.style.transform =
        dist < 150
          ? `translate(${(event.clientX - cx) * 0.22}px, ${(event.clientY - cy) * 0.22}px)`
          : "translate(0, 0)";
    }
    function reset() {
      cta!.style.transform = "translate(0, 0)";
    }

    window.addEventListener("pointermove", handleMove);
    root.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      root.removeEventListener("pointerleave", reset);
    };
  }, []);

  const gallery = products.slice(0, 4);

  return (
    <section
      ref={rootRef}
      className="shell relative pb-12 pt-10 sm:pt-14 lg:pb-16 lg:pt-20"
    >
      <div className="max-w-5xl">
        <span className="eyebrow reveal-up">{content.eyebrow}</span>
        <h1
          className="reveal-up mt-6 font-heading text-[clamp(2.75rem,8.2vw,6.75rem)] font-bold leading-[0.9] tracking-[-0.045em] text-foreground"
          style={{ animationDelay: "70ms" }}
        >
          {content.title}
        </h1>
        <div
          className="reveal-up mt-8 flex flex-col gap-6 sm:flex-row sm:items-center"
          style={{ animationDelay: "170ms" }}
        >
          <div
            ref={ctaRef}
            className="w-fit transition-transform duration-300 ease-out will-change-transform"
          >
            <HeroCta fallbackHref={content.ctaHref ?? "/produkty"} />
          </div>
          <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {content.description}
          </p>
        </div>

        <ul
          className="reveal-up mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
          style={{ animationDelay: "210ms" }}
        >
          <li>Natychmiastowy dostęp</li>
          <li aria-hidden className="text-foreground/25">/</li>
          <li>Bezpieczne płatności</li>
          <li aria-hidden className="text-foreground/25">/</li>
          <li>Bezterminowa licencja</li>
        </ul>
      </div>

      <div
        className="reveal-up mt-12 flex items-center gap-6"
        style={{ animationDelay: "260ms" }}
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
          Najczęściej wybierane
        </span>
        <div className="h-px flex-1 bg-border" />
        <Link
          href="/produkty"
          className="group inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground"
        >
          Cała kolekcja
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {gallery.map((product, index) => {
          const dark = index % 2 === 1;
          return (
            <Link
              key={product.id}
              href={`/produkty/${product.slug}`}
              aria-label={`Zobacz produkt: ${product.name}`}
              className={`reveal-up paper-grain group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-[0.9rem] border p-5 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1.5 ${
                dark
                  ? "border-white/10 bg-[#14110c] text-stone-100"
                  : "border-stone-900/10 text-stone-900"
              }`}
              style={{
                ...(dark
                  ? {}
                  : { backgroundColor: COVER_TINTS[index % COVER_TINTS.length] }),
                animationDelay: `${320 + index * 90}ms`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-55">
                  {product.category}
                </span>
                <span className="font-mono text-[11px] tabular-nums opacity-45">
                  N°{String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <div className="mb-3 h-px w-8 bg-current opacity-30" />
                <h3 className="font-heading text-xl font-bold leading-[1.0] tracking-[-0.025em] sm:text-2xl">
                  {product.name}
                </h3>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-sm font-semibold opacity-70">
                    {formatCurrency(product.price)}
                  </span>
                  <ArrowUpRight className="size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

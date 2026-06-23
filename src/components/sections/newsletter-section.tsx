import { Gift, MailCheck, Sparkles } from "lucide-react";

import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="shell section-space">
      <div className="relative overflow-hidden rounded-[2.8rem] border border-stone-950/10 bg-[linear-gradient(135deg,#181510_0%,#262016_48%,#f3eadb_48%,#fbf7ef_100%)] p-6 shadow-[0_32px_90px_-62px_rgba(22,18,12,.75)] sm:p-10">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-72 rounded-full bg-gradient-to-br from-amber-300/35 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -left-20 bottom-0 size-64 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-100 backdrop-blur">
              <Sparkles className="size-3.5" />
              Newsletter Templify
            </span>
            <h2 className="max-w-2xl text-3xl text-[#fff] sm:text-5xl">
              Bezpłatna próbka e-booka i -15% na pierwszy zakup.
            </h2>
            <p className="max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              Zostaw e-mail — od razu dostaniesz link do bezpłatnej próbki
              naszego najtańszego e-booka i kod rabatowy na start. Potem raz w
              tygodniu krótka wskazówka o finansach, zdrowiu, czasie albo
              macierzyństwie. Zero spamu, zero ściemy. Wypisujesz się jednym
              kliknięciem.
            </p>
            <ul className="grid max-w-xl gap-2 text-sm text-white/[0.78] sm:grid-cols-3">
              <li className="rounded-2xl border border-white/[0.12] bg-white/[0.08] px-3 py-2">
                bez spamu
              </li>
              <li className="rounded-2xl border border-white/[0.12] bg-white/[0.08] px-3 py-2">
                max 1 e-mail tygodniowo
              </li>
              <li className="rounded-2xl border border-amber-200/40 bg-amber-200 px-3 py-2 font-bold text-stone-950">
                -15% na pierwszy zakup
              </li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-stone-950/10 bg-white/[0.88] p-5 shadow-[0_24px_70px_-45px_rgba(20,16,10,.7)] backdrop-blur sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-stone-950 text-white">
                <Gift className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-stone-950">
                  Odbierz próbkę i kod TEMPLIFY15
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  Link do próbki przyjdzie od razu po zapisie.
                </p>
              </div>
            </div>
            <NewsletterForm source="home_newsletter_discount" />
            <p className="mt-3 flex items-center gap-2 text-xs text-stone-500">
              <MailCheck className="size-3.5" />
              Bez ukrytych zgód marketingowych. Tylko newsletter Templify.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

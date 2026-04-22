import Link from "next/link";
import { ArrowUpRight, Brain, Clock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TestPromoSection() {
  return (
    <section className="shell section-space">
      <div className="surface-panel gold-frame relative overflow-hidden p-8 sm:p-12">
        <div
          aria-hidden
          className="absolute -right-24 top-1/2 size-80 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary/35 via-primary/10 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -left-20 -bottom-20 size-72 rounded-full bg-gradient-to-tr from-primary/20 to-transparent blur-3xl"
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center">
          <div className="space-y-5">
            <span className="eyebrow">
              <Brain className="size-3.5" />
              Bezpłatny test · Big Five
            </span>
            <h2 className="font-heading text-4xl text-foreground sm:text-5xl">
              Sprawdź, jaki styl pracy naprawdę pasuje do Ciebie.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              10 krótkich pytań, wynik od razu. Dostaniesz naukowy profil osobowości (TIPI,
              Gosling et al. 2003), Twoje mocne strony, obszary do pilnowania i kategorię
              szablonów dopasowaną do Twojego stylu.
            </p>

            <ul className="grid gap-3 sm:grid-cols-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Clock className="mt-0.5 size-4 text-primary" />
                2 minuty
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 text-primary" />
                Prywatnie, bez zapisów
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <Brain className="mt-0.5 size-4 text-primary" />
                Oparty o Big Five
              </li>
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="/test" />}>
                Zacznij test
                <ArrowUpRight className="size-4" />
              </Button>
              <Button variant="outline" size="lg" render={<Link href="/produkty" />}>
                Przejdź od razu do katalogu
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="surface-strong space-y-4 rounded-[2rem] p-6 shadow-[0_40px_120px_-50px_rgba(139,94,52,0.35)]">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-muted-foreground">
                <span>Twój profil Big Five</span>
                <span>przykład</span>
              </div>
              {[
                { label: "Sumienność", value: 86 },
                { label: "Otwartość", value: 74 },
                { label: "Ekstrawersja", value: 52 },
                { label: "Ugodowość", value: 65 },
                { label: "Stabilność emocjonalna", value: 71 },
              ].map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm text-foreground">
                    <span>{row.label}</span>
                    <span className="text-muted-foreground">{row.value}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/50 to-primary"
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-xs text-foreground">
                <p className="font-semibold text-primary">Rekomendacja</p>
                <p className="mt-1 text-muted-foreground">
                  Planowanie i Notion · systemy tygodnia i log decyzji.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

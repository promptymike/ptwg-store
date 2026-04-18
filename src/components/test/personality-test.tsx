"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  TIPI_ITEMS,
  LIKERT_OPTIONS,
  TRAIT_LABELS,
  TRAIT_INSIGHTS,
  classifyLevel,
  getTopTraits,
  percentFromScore,
  pickRecommendation,
  scoreTipi,
  type TraitKey,
} from "@/lib/personality-test";

type Phase = "intro" | "quiz" | "result";

const INTRO_SUBTITLE =
  "10 krótkich pytań · ok. 2 minuty · TIPI (Gosling, Rentfrow & Swann, 2003)";

export function PersonalityTest() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const totalSteps = TIPI_ITEMS.length;
  const currentItem = TIPI_ITEMS[stepIndex];

  const scores = useMemo(() => scoreTipi(answers), [answers]);
  const recommendation = useMemo(() => pickRecommendation(scores), [scores]);
  const topTraits = useMemo(() => getTopTraits(scores, 2), [scores]);

  function handleSelect(value: number) {
    setAnswers((current) => ({ ...current, [currentItem.id]: value }));
  }

  function handleNext() {
    if (stepIndex < totalSteps - 1) {
      setStepIndex((value) => value + 1);
      return;
    }
    setPhase("result");
  }

  function handlePrev() {
    if (stepIndex === 0) {
      setPhase("intro");
      return;
    }
    setStepIndex((value) => value - 1);
  }

  function handleRestart() {
    setAnswers({});
    setStepIndex(0);
    setPhase("intro");
  }

  if (phase === "intro") {
    return (
      <div className="surface-panel gold-frame space-y-8 p-8 sm:p-12">
        <div className="space-y-4">
          <span className="eyebrow">
            <Sparkles className="size-3.5" />
            Bezpłatny test
          </span>
          <h1 className="text-4xl text-foreground sm:text-5xl">
            Poznaj swój styl pracy w 2 minuty
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Krótki, naukowy kwestionariusz osobowości Big Five w wersji TIPI. Po odpowiedzi
            dostaniesz profil Twoich pięciu cech, mocne strony, obszary do pilnowania oraz
            kategorię szablonów najlepiej dopasowaną do Ciebie.
          </p>
          <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
            {INTRO_SUBTITLE}
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Big Five",
              value: "Naukowy model",
              description: "Najczęściej cytowany model osobowości w psychologii.",
            },
            {
              label: "Prywatność",
              value: "Zero zapisów",
              description: "Odpowiedzi pozostają na Twoim urządzeniu.",
            },
            {
              label: "Wynik",
              value: "Natychmiast",
              description: "Profil i rekomendacja szablonów pojawiają się od razu.",
            },
          ].map((item) => (
            <li
              key={item.label}
              className="rounded-2xl border border-border/70 bg-background/60 p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-primary/75">{item.label}</p>
              <p className="mt-1 text-lg text-foreground">{item.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => {
              setPhase("quiz");
              setStepIndex(0);
            }}
          >
            Zacznij test
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" size="lg" render={<Link href="/produkty" />}>
            Wolę obejrzeć katalog
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const selected = answers[currentItem.id];
    const progressPercent = ((stepIndex + (selected ? 1 : 0)) / totalSteps) * 100;

    return (
      <div className="surface-panel gold-frame space-y-8 p-8 sm:p-12">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-muted-foreground">
            <span>
              Pytanie {stepIndex + 1} z {totalSteps}
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-border/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-[width] duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Widzę siebie jako osobę, która jest:</p>
          <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
            „{currentItem.statement}”
          </h2>
          <p className="text-sm text-muted-foreground">
            Jak bardzo ten opis pasuje do Ciebie w kontekście pracy i codziennych decyzji?
          </p>
        </div>

        <div className="grid gap-2">
          {LIKERT_OPTIONS.map((option) => {
            const isActive = selected === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  isActive
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                <span
                  className={`inline-flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/80 text-foreground"
                  }`}
                >
                  {option.value}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" onClick={handlePrev}>
            <ArrowLeft className="size-4" />
            {stepIndex === 0 ? "Wróć do intro" : "Poprzednie"}
          </Button>
          <Button onClick={handleNext} disabled={!selected}>
            {stepIndex === totalSteps - 1 ? "Zobacz wynik" : "Następne"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="surface-panel gold-frame space-y-8 p-8 sm:p-12">
        <div className="space-y-3">
          <span className="eyebrow">
            <CheckCircle2 className="size-3.5" />
            Twój profil
          </span>
          <h2 className="text-4xl text-foreground sm:text-5xl">
            {describeStyle(topTraits)}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Wynik oparty o TIPI (Gosling, Rentfrow & Swann, 2003). Pokazujemy Twoje 5 cech Big
            Five jako profil roboczy. Nie diagnozujemy — dajemy punkt wyjścia do wyboru
            szablonów, które realnie wesprą Twoją pracę.
          </p>
        </div>

        <div className="space-y-3">
          {(Object.keys(TRAIT_LABELS) as TraitKey[]).map((trait) => {
            const score = scores[trait];
            const percent = percentFromScore(score);
            const level = classifyLevel(score);
            return (
              <div
                key={trait}
                className="rounded-2xl border border-border/70 bg-background/60 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {TRAIT_LABELS[trait].name}
                  </p>
                  <p className="text-xs uppercase tracking-[0.22em] text-primary/80">
                    {level === "high" ? "wysoka" : level === "low" ? "niska" : "przeciętna"} ·{" "}
                    {score.toFixed(1)} / 7
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/50 to-primary transition-[width] duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-panel space-y-4 p-6 sm:p-8">
          <p className="eyebrow">Co wychodzi Ci dobrze</p>
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {topTraits.map((trait) => (
              <li key={trait} className="flex gap-3">
                <span className="mt-1 inline-flex size-1.5 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="font-semibold text-foreground">{TRAIT_LABELS[trait].name}</p>
                  <p>{TRAIT_INSIGHTS[trait].strength}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-panel space-y-4 p-6 sm:p-8">
          <p className="eyebrow">Na co uważać</p>
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {topTraits.map((trait) => (
              <li key={trait} className="flex gap-3">
                <span className="mt-1 inline-flex size-1.5 shrink-0 rounded-full bg-destructive/70" />
                <div>
                  <p className="font-semibold text-foreground">{TRAIT_LABELS[trait].name}</p>
                  <p>{TRAIT_INSIGHTS[trait].watch}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="surface-panel relative overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden
          className="absolute -right-20 -top-20 size-60 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-3xl"
        />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-3">
            <p className="eyebrow">Rekomendowana kategoria</p>
            <h3 className="text-3xl text-foreground sm:text-4xl">{recommendation.headline}</h3>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {recommendation.reason}
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-primary/80">
              Kategoria: {recommendation.categoryTitle}
            </p>
          </div>
          <div className="flex flex-col gap-2 lg:items-end">
            <Button size="lg" render={<Link href={recommendation.href} />}>
              Zobacz dopasowane produkty
              <ArrowUpRight className="size-4" />
            </Button>
            <Button variant="outline" onClick={handleRestart}>
              <RefreshCw className="size-4" />
              Zrób test ponownie
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function describeStyle(top: TraitKey[]): string {
  const labels = top.map((trait) => TRAIT_LABELS[trait].short.toLowerCase());
  if (labels.length === 0) return "Twój styl pracy";
  if (labels.length === 1) return `Twój styl opiera się na ${labels[0]}`;
  return `Twój styl: ${labels[0]} + ${labels[1]}`;
}

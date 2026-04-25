"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export type OnboardingStep = {
  title: string;
  body: string;
  href?: string;
  hrefLabel?: string;
};

type OnboardingTourProps = {
  id: string;
  steps: OnboardingStep[];
  intro?: {
    eyebrow?: string;
    title: string;
    body: string;
  };
  /**
   * Delay before the tour appears, in ms. Lets the page fully hydrate so
   * the modal doesn't pop up before the user can see what it's pointing at.
   */
  delayMs?: number;
};

const STORAGE_PREFIX = "templify:onboarding:";

function readDone(id: string) {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(`${STORAGE_PREFIX}${id}`) === "1";
  } catch {
    return true;
  }
}

function markDone(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${id}`, "1");
  } catch {
    // private mode — give up silently, the tour just shows once per
    // session in that case which is acceptable.
  }
}

export function OnboardingTour({
  id,
  steps,
  intro,
  delayMs = 600,
}: OnboardingTourProps) {
  const [stage, setStage] = useState<"hidden" | "intro" | "step">("hidden");
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (readDone(id)) return;
    const t = window.setTimeout(() => {
      setStage(intro ? "intro" : "step");
    }, delayMs);
    return () => window.clearTimeout(t);
  }, [id, intro, delayMs]);

  // Lock body scroll while the tour is on top of the page.
  useEffect(() => {
    if (stage === "hidden") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [stage]);

  // Allow Escape to dismiss the tour entirely.
  useEffect(() => {
    if (stage === "hidden") return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") finish();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const finish = useCallback(() => {
    markDone(id);
    setStage("hidden");
  }, [id]);

  const handleStart = useCallback(() => {
    setStage("step");
    setStepIndex(0);
  }, []);

  const handleNext = useCallback(() => {
    setStepIndex((idx) => {
      if (idx + 1 >= steps.length) {
        markDone(id);
        setStage("hidden");
        return idx;
      }
      return idx + 1;
    });
  }, [id, steps.length]);

  if (stage === "hidden") return null;

  const isIntro = stage === "intro";
  const step = steps[stepIndex];
  const totalSteps = steps.length;
  const isLast = stepIndex === totalSteps - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Samouczek"
    >
      <button
        type="button"
        aria-label="Pomiń samouczek"
        onClick={finish}
        className="absolute inset-0 cursor-default bg-stone-950/55 backdrop-blur-sm animate-in fade-in duration-200"
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_40px_100px_-30px_rgba(0,0,0,0.55)] animate-in fade-in slide-in-from-bottom-3 duration-250 sm:slide-in-from-bottom-1">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0" />
        {totalSteps > 1 && !isIntro ? (
          <div className="absolute inset-x-0 top-0 z-10 flex">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 transition-colors duration-300 ${
                  i <= stepIndex ? "bg-primary" : "bg-border/40"
                }`}
              />
            ))}
          </div>
        ) : null}

        <button
          type="button"
          aria-label="Pomiń samouczek"
          onClick={finish}
          className="absolute right-3 top-3 z-20 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="space-y-5 p-6 pt-9 sm:p-8 sm:pt-10">
          {isIntro && intro ? (
            <>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-primary/80">
                <Sparkles className="size-3.5" />
                {intro.eyebrow ?? "Witamy w Templify"}
              </div>
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                {intro.title}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                {intro.body}
              </p>
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={finish}>
                  Pomiń
                </Button>
                <Button onClick={handleStart}>
                  Rozpocznij ({totalSteps} {totalSteps === 1 ? "krok" : "kroki"})
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.22em] text-primary/80">
                Krok {stepIndex + 1} z {totalSteps}
              </p>
              <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                {step.title}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                {step.body}
              </p>
              {step.href ? (
                <Link
                  href={step.href}
                  onClick={finish}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary/80"
                >
                  {step.hrefLabel ?? "Otwórz"}
                  <ArrowRight className="size-4" />
                </Link>
              ) : null}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" onClick={finish}>
                  Pomiń resztę
                </Button>
                <Button onClick={handleNext}>
                  {isLast ? "Zaczynamy" : "Dalej"}
                  {!isLast ? <ArrowRight className="size-4" /> : null}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Gift, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { STREAK_EVENT, readStreak } from "@/lib/reading-streak";

const STREAK_REWARD_THRESHOLD = 7;
const REWARD_CODE = "STREAK10";
const REWARD_PERCENT = 10;

export function StreakRewardCard() {
  const [streakCurrent, setStreakCurrent] = useState(0);
  const [streakBest, setStreakBest] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const initial = readStreak();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-time hydration
    setStreakCurrent(initial.current);
    setStreakBest(initial.best);
    function refresh() {
      const state = readStreak();
      setStreakCurrent(state.current);
      setStreakBest(state.best);
    }
    window.addEventListener(STREAK_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STREAK_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const eligibility = useMemo(() => {
    const peak = Math.max(streakCurrent, streakBest);
    return {
      unlocked: peak >= STREAK_REWARD_THRESHOLD,
      remaining: Math.max(0, STREAK_REWARD_THRESHOLD - peak),
      peak,
    };
  }, [streakCurrent, streakBest]);

  if (!eligibility.unlocked) {
    if (eligibility.peak === 0) return null;
    return (
      <div className="surface-panel border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
            <Sparkles className="size-4" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Streak {eligibility.peak} z {STREAK_REWARD_THRESHOLD}
            </p>
            <p className="text-xs text-muted-foreground">
              Po 7 dniach z rzędu odblokowujesz kod{" "}
              <span className="font-semibold text-foreground">−{REWARD_PERCENT}%</span>{" "}
              na cały katalog. Zostało Ci {eligibility.remaining}{" "}
              {eligibility.remaining === 1 ? "dzień" : "dni"}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-panel relative overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/12 via-emerald-500/4 to-transparent p-5">
      <div
        aria-hidden
        className="absolute -right-12 -top-12 size-40 rounded-full bg-emerald-500/15 blur-3xl"
      />
      <div className="relative space-y-3">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            <Gift className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">
              Odblokowana nagroda
            </p>
            <p className="text-base font-semibold text-foreground">
              −{REWARD_PERCENT}% na każdy ebook
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Twój 7-dniowy streak (rekord {streakBest}) odblokował kod
              promocyjny. Wpisz go w koszyku przy następnym zakupie.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-full border border-emerald-500/30 bg-background/70 px-4 py-2 text-sm font-bold tracking-[0.18em] text-foreground">
            {REWARD_CODE}
          </code>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(REWARD_CODE);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1800);
              } catch {
                // ignore
              }
            }}
          >
            {copied ? (
              <>
                <Check className="size-3.5" />
                Skopiowano
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                Kopiuj kod
              </>
            )}
          </Button>
          <Button size="sm" render={<Link href="/produkty" />}>
            Wybierz ebook
          </Button>
        </div>
      </div>
    </div>
  );
}

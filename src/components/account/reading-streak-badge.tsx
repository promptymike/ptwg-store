"use client";

import { useEffect, useState } from "react";
import { Flame, Sparkles, Trophy } from "lucide-react";

import {
  type StreakState,
  STREAK_EVENT,
  readStreak,
  refreshStreakDecay,
} from "@/lib/reading-streak";

const EMPTY: StreakState = {
  current: 0,
  best: 0,
  lastReadOn: null,
  totalDays: 0,
};

export function ReadingStreakBadge() {
  const [state, setState] = useState<StreakState>(EMPTY);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot localStorage hydration on mount
    setState(refreshStreakDecay());
    function handler() {
      setState(readStreak());
    }
    window.addEventListener(STREAK_EVENT, handler);
    window.addEventListener("storage", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handler();
    });
    return () => {
      window.removeEventListener(STREAK_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  if (state.current === 0 && state.best === 0) {
    return (
      <div className="rounded-[1.4rem] border border-border/70 bg-background/60 px-5 py-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
          Streak
        </p>
        <p className="mt-2 flex items-center gap-2 text-2xl text-foreground">
          <Sparkles className="size-5 text-primary" />
          Pierwsza sesja czeka
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Otwórz dowolny ebook, by rozpocząć codzienny streak.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.4rem] border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent px-5 py-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-amber-700 dark:text-amber-400">
        Streak czytania
      </p>
      <p className="mt-2 flex items-baseline gap-2 text-2xl text-foreground">
        <Flame className="size-5 text-amber-600 dark:text-amber-400" />
        <span className="tabular-nums font-semibold">{state.current}</span>
        <span className="text-base text-muted-foreground">
          {state.current === 1 ? "dzień z rzędu" : "dni z rzędu"}
        </span>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Trophy className="size-3.5" />
          rekord {state.best} {state.best === 1 ? "dzień" : "dni"}
        </span>
        <span>·</span>
        <span>łącznie {state.totalDays} {state.totalDays === 1 ? "dzień" : "dni"} czytania</span>
      </div>
      {state.current >= 3 ? (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
          Dobrze idzie. Wróć jutro, żeby dorzucić +1.
        </p>
      ) : null}
    </div>
  );
}

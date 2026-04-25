// Reading streak — counts consecutive UTC days the user opened any
// ebook in their library. Pure localStorage so it follows the browser
// (and stays anonymous). Days reset to 0 the moment a full calendar
// day passes without an "opened" event.

export const STREAK_STORAGE_KEY = "templify:reading-streak";
export const STREAK_EVENT = "templify-reading-streak-updated";

export type StreakState = {
  /** Consecutive days, including today if read today. */
  current: number;
  /** Best streak ever achieved on this browser. */
  best: number;
  /** ISO date (YYYY-MM-DD) of the last day a book was opened. */
  lastReadOn: string | null;
  /** Total distinct days the user opened a book. */
  totalDays: number;
};

const EMPTY: StreakState = {
  current: 0,
  best: 0,
  lastReadOn: null,
  totalDays: 0,
};

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function dayDiff(a: string, b: string) {
  const aDate = new Date(`${a}T00:00:00Z`);
  const bDate = new Date(`${b}T00:00:00Z`);
  return Math.round((bDate.getTime() - aDate.getTime()) / 86_400_000);
}

export function readStreak(): StreakState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<StreakState>;
    return {
      current: Number(parsed.current) || 0,
      best: Number(parsed.best) || 0,
      lastReadOn: typeof parsed.lastReadOn === "string" ? parsed.lastReadOn : null,
      totalDays: Number(parsed.totalDays) || 0,
    };
  } catch {
    return EMPTY;
  }
}

function writeStreak(state: StreakState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(STREAK_EVENT));
  } catch {
    // private mode / quota — accept silently
  }
}

/**
 * Visualises the current streak state for the day. Idempotent — calling
 * it twice in the same day does not double-increment.
 */
export function recordReadEvent(): StreakState {
  const state = readStreak();
  const today = todayIso();

  if (state.lastReadOn === today) {
    return state;
  }

  let nextCurrent = 1;
  if (state.lastReadOn) {
    const diff = dayDiff(state.lastReadOn, today);
    if (diff === 1) nextCurrent = state.current + 1;
    else if (diff > 1) nextCurrent = 1;
    else nextCurrent = state.current; // future date guard, no-op
  }

  const next: StreakState = {
    current: nextCurrent,
    best: Math.max(state.best, nextCurrent),
    lastReadOn: today,
    totalDays: state.totalDays + 1,
  };
  writeStreak(next);
  return next;
}

/**
 * Adjusts the current streak when the page loads — if the user missed
 * a day, the current streak drops to 0 even though they didn't open a
 * book. Stops the badge showing "🔥 7 dni" forever after a 3-day gap.
 */
export function refreshStreakDecay(): StreakState {
  const state = readStreak();
  if (!state.lastReadOn) return state;
  const diff = dayDiff(state.lastReadOn, todayIso());
  if (diff <= 0) return state;
  if (diff === 0) return state;
  if (diff > 1 && state.current > 0) {
    const next = { ...state, current: 0 };
    writeStreak(next);
    return next;
  }
  return state;
}

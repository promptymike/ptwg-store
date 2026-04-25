"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import {
  CONSENT_COOKIE_KEY,
  CONSENT_STORAGE_KEY,
  CONSENT_UPDATED_EVENT,
  type ConsentState,
  readConsentFromStorage,
} from "@/lib/consent";

type CookieConsentBannerProps = {
  initialHasConsent: boolean;
};

type ConsentCategory = "necessary" | "analytics" | "marketing";

function writeConsent(consent: ConsentState) {
  const serialized = JSON.stringify(consent);
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
  } catch {
    // private mode or storage quota — safe to ignore, cookie still persists
  }
  try {
    document.cookie = `${CONSENT_COOKIE_KEY}=${encodeURIComponent(serialized)}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
  } catch {
    // no-op
  }
  try {
    window.dispatchEvent(
      new CustomEvent(CONSENT_UPDATED_EVENT, {
        detail: consent,
      }),
    );
  } catch {
    // no-op
  }
}

function buildConsentState(
  overrides: Partial<Omit<ConsentState, "updatedAt">>,
): ConsentState {
  return {
    necessary: true,
    analytics: overrides.analytics ?? false,
    marketing: overrides.marketing ?? false,
    updatedAt: new Date().toISOString(),
  };
}

function subscribeToConsent(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", onChange);
  window.addEventListener(CONSENT_UPDATED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CONSENT_UPDATED_EVENT, onChange);
  };
}

let cachedConsentSnapshot: Partial<ConsentState> | null = null;
let cachedConsentRaw: string | null = "";

function getConsentSnapshot(): Partial<ConsentState> | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (raw === cachedConsentRaw) {
    return cachedConsentSnapshot;
  }

  cachedConsentRaw = raw;
  cachedConsentSnapshot = readConsentFromStorage();
  return cachedConsentSnapshot;
}

const SERVER_HAS_CONSENT_SENTINEL: Partial<ConsentState> = Object.freeze({});

export function CookieConsentBanner({
  initialHasConsent,
}: CookieConsentBannerProps) {
  const getServerSnapshot = useCallback(
    () => (initialHasConsent ? SERVER_HAS_CONSENT_SENTINEL : null),
    [initialHasConsent],
  );
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (consent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync analytics/marketing checkboxes from external store
      setAnalytics(Boolean(consent.analytics));
      setMarketing(Boolean(consent.marketing));
    }
  }, [consent]);

  const saveConsent = useCallback((next: ConsentState) => {
    writeConsent(next);
    setDismissed(true);
    setIsSettingsOpen(false);
  }, []);

  if (consent !== null || dismissed) {
    return null;
  }

  // Slim, single-row strip on desktop. Settings panel expands ABOVE the
  // strip when the user opens it — never overlaps form CTAs in the
  // viewport, never blocks the area where buyers read product detail.
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 px-3 sm:bottom-4 sm:px-4">
      <div className="pointer-events-auto mx-auto max-w-5xl space-y-2">
        {isSettingsOpen ? (
          <div className="rounded-[1.5rem] border border-border/80 bg-card/95 p-4 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.4)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  key: "necessary" as ConsentCategory,
                  label: "Niezbędne",
                  description: "Wymagane do działania sklepu, logowania i biblioteki.",
                  checked: true,
                  disabled: true,
                },
                {
                  key: "analytics" as ConsentCategory,
                  label: "Analityczne",
                  description: "Pomiar page view i interakcji wyłącznie po zgodzie.",
                  checked: analytics,
                  disabled: false,
                },
                {
                  key: "marketing" as ConsentCategory,
                  label: "Marketingowe",
                  description: "Remarketing i kampanie zgodne z udzieloną zgodą.",
                  checked: marketing,
                  disabled: false,
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-start justify-between gap-3 rounded-[1.1rem] border border-border/70 bg-secondary/45 p-3 transition ${item.disabled ? "opacity-70" : "cursor-pointer hover:border-primary/30"}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    disabled={item.disabled}
                    onChange={(event) => {
                      if (item.key === "analytics") {
                        setAnalytics(event.target.checked);
                      }
                      if (item.key === "marketing") {
                        setMarketing(event.target.checked);
                      }
                    }}
                    className="mt-1 size-4 shrink-0 accent-[var(--color-foreground)]"
                  />
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 rounded-full border border-border/80 bg-card/95 px-4 py-2.5 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-4 sm:py-2">
          <p className="min-w-0 flex-1 text-sm leading-5 text-foreground">
            <span className="font-semibold">Cookies i prywatność.</span>{" "}
            <span className="text-muted-foreground">
              Używamy niezbędnych cookies do działania sklepu. Wybierz, co dodatkowo.
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <button
              type="button"
              onClick={() => {
                if (isSettingsOpen) {
                  saveConsent(buildConsentState({ analytics, marketing }));
                  return;
                }
                setIsSettingsOpen(true);
              }}
              className="inline-flex h-9 shrink-0 items-center rounded-full px-3 text-xs font-semibold text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
            >
              {isSettingsOpen ? "Zapisz wybór" : "Ustawienia"}
            </button>
            <button
              type="button"
              onClick={() =>
                saveConsent(
                  buildConsentState({ analytics: false, marketing: false }),
                )
              }
              className="inline-flex h-9 shrink-0 items-center rounded-full border border-border/70 bg-background/70 px-4 text-xs font-semibold text-foreground transition hover:border-primary/30"
            >
              Odrzucam
            </button>
            <button
              type="button"
              onClick={() =>
                saveConsent(
                  buildConsentState({ analytics: true, marketing: true }),
                )
              }
              className="inline-flex h-9 shrink-0 items-center rounded-full border border-primary/40 bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-[0_12px_30px_-18px_rgba(226,188,114,0.7)] transition hover:bg-primary/90"
            >
              Akceptuję
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

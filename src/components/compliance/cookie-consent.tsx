"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CONSENT_COOKIE_KEY,
  CONSENT_STORAGE_KEY,
  CONSENT_UPDATED_EVENT,
  type ConsentState,
  readConsentFromStorage,
} from "@/lib/consent";

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

export function CookieConsentBanner() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = readConsentFromStorage();
    const nextVisible = stored === null;
    const nextAnalytics = Boolean(stored?.analytics);
    const nextMarketing = Boolean(stored?.marketing);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe post-mount read of localStorage consent
    setHasMounted(true);
    setIsVisible(nextVisible);
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
  }, []);

  if (!hasMounted) {
    return null;
  }

  function saveConsent(consent: ConsentState) {
    writeConsent(consent);
    setIsVisible(false);
    setIsSettingsOpen(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-border/80 bg-card/95 p-5 shadow-[0_30px_90px_-40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/75">
                Cookies i prywatność
              </p>
              <h3 className="font-heading text-3xl text-foreground">
                Ustawienia prywatności w Templify
              </h3>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Używamy tylko niezbędnych cookies do działania sklepu oraz opcjonalnych kategorii
                analitycznych i marketingowych. Możesz wszystko zaakceptować, odrzucić lub
                skonfigurować ręcznie — zmienisz to później w ustawieniach.
              </p>
            </div>

            {isSettingsOpen ? (
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
                    description: "Pomiar page view, produktu, koszyka i checkoutu wyłącznie po zgodzie.",
                    checked: analytics,
                    disabled: false,
                  },
                  {
                    key: "marketing" as ConsentCategory,
                    label: "Marketingowe",
                    description: "Przyszły remarketing i kampanie zgodne z udzieloną zgodą.",
                    checked: marketing,
                    disabled: false,
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="rounded-[1.4rem] border border-border/70 bg-secondary/45 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
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
                        className="mt-1 size-4 accent-[var(--color-foreground)]"
                      />
                    </div>
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <Button
              className="w-full lg:w-auto"
              onClick={() => saveConsent(buildConsentState({ analytics: true, marketing: true }))}
            >
              Akceptuję
            </Button>
            <Button
              variant="outline"
              className="w-full lg:w-auto"
              onClick={() =>
                saveConsent(buildConsentState({ analytics: false, marketing: false }))
              }
            >
              Odrzucam
            </Button>
            <Button
              variant="ghost"
              className="w-full lg:w-auto"
              onClick={() => {
                if (isSettingsOpen) {
                  saveConsent(buildConsentState({ analytics, marketing }));
                  return;
                }

                setIsSettingsOpen(true);
              }}
            >
              {isSettingsOpen ? "Zapisz ustawienia" : "Ustawienia"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

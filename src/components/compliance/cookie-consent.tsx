"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type ConsentCategory = "necessary" | "analytics" | "marketing";

type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "templify-cookie-consent";
const COOKIE_KEY = "templify_cookie_consent";

function readStoredConsent() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as Partial<ConsentState>;
  } catch {
    return null;
  }
}

function writeConsent(consent: ConsentState) {
  const serialized = JSON.stringify(consent);
  window.localStorage.setItem(STORAGE_KEY, serialized);
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(serialized)}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
}

function buildConsentState(overrides: Partial<Omit<ConsentState, "updatedAt">>): ConsentState {
  return {
    necessary: true,
    analytics: overrides.analytics ?? false,
    marketing: overrides.marketing ?? false,
    updatedAt: new Date().toISOString(),
  };
}

export function CookieConsentBanner() {
  const storedConsent = readStoredConsent();
  const [isVisible, setIsVisible] = useState(() => storedConsent === null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(() => Boolean(storedConsent?.analytics));
  const [marketing, setMarketing] = useState(() => Boolean(storedConsent?.marketing));

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
                Cookies & privacy
              </p>
              <h3 className="font-heading text-3xl text-foreground">
                Ustawienia prywatności w Templify
              </h3>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                Używamy niezbędnych cookies do działania sklepu oraz opcjonalnych kategorii
                analitycznych i marketingowych. Zgody są zapisywane lokalnie i mogą zostać później
                podpięte do narzędzi trackingowych.
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
                    description: "Przyszłe statystyki, pomiary ruchu i optymalizacja UX.",
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

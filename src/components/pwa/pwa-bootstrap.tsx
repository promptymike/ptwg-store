"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const DISMISS_KEY = "templify:pwa-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaBootstrap() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Service worker registration — kept best-effort so a failure here
  // never blocks the page render.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error) => {
          console.warn("[pwa] sw register failed", error);
        });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  // Capture beforeinstallprompt so we can show our own install card
  // instead of relying on Chrome's native one (which we'd lose on
  // navigation otherwise).
  useEffect(() => {
    if (typeof window === "undefined") return;
    function handle(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handle);
    return () => window.removeEventListener("beforeinstallprompt", handle);
  }, []);

  const dismissed =
    typeof window !== "undefined" &&
    window.localStorage.getItem(DISMISS_KEY) === "1";

  if (!installEvent || dismissed) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="surface-panel flex items-start gap-3 p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Download className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Zainstaluj Templify
          </p>
          <p className="text-xs text-muted-foreground">
            Bibliotekę i czytnik możesz mieć jako aplikację — szybciej startuje
            i pokazuje ostatnio czytane od razu po włączeniu.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await installEvent.prompt();
                  const choice = await installEvent.userChoice;
                  if (choice.outcome === "accepted") {
                    setInstallEvent(null);
                  }
                } catch {
                  // user cancelled or browser denied — keep card available
                }
              }}
            >
              Zainstaluj
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                try {
                  window.localStorage.setItem(DISMISS_KEY, "1");
                } catch {
                  // ignore
                }
                setInstallEvent(null);
              }}
            >
              Później
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Zamknij"
          onClick={() => {
            try {
              window.localStorage.setItem(DISMISS_KEY, "1");
            } catch {
              // ignore
            }
            setInstallEvent(null);
          }}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Sparkles, X } from "lucide-react";

const PROMO_CODE = "TEMPLIFY15";
const STORAGE_KEY = "templify:promo-strip-dismissed";

export function PromoStrip() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      dismissed = false;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe post-mount read of localStorage
    setIsVisible(!dismissed);
  }, []);

  function handleCopy() {
    navigator.clipboard?.writeText(PROMO_CODE).catch(() => undefined);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1800);
  }

  function handleDismiss() {
    setIsVisible(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // no-op
    }
  }

  if (!isVisible) return null;

  return (
    <div className="relative overflow-hidden border-b border-primary/20 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 text-foreground">
      <div className="shell flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 py-2 text-center text-[13px]">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Sparkles className="size-3.5 text-primary" />
          Wiosenny rabat −15% na cały katalog
        </span>
        <span className="text-muted-foreground">—</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-primary-foreground"
          aria-label={`Skopiuj kod ${PROMO_CODE}`}
        >
          {PROMO_CODE}
          {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
        <span className="text-muted-foreground">wklej w koszyku</span>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Zamknij pasek"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition hover:bg-background/80 hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

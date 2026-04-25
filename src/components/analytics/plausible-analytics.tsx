"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";

import {
  CONSENT_UPDATED_EVENT,
  hasAnalyticsConsent,
} from "@/lib/consent";
import { env } from "@/lib/env";

function subscribeToConsent(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }
  window.addEventListener(CONSENT_UPDATED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CONSENT_UPDATED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getConsent() {
  return hasAnalyticsConsent();
}

function getServerConsent() {
  return false;
}

export function PlausibleAnalytics() {
  const enabled = useSyncExternalStore(
    subscribeToConsent,
    getConsent,
    getServerConsent,
  );

  const domain = env.plausibleDomain;
  const scriptSrc = env.plausibleScriptSrc;

  if (!enabled || !domain) {
    return null;
  }

  return (
    <Script
      defer
      strategy="afterInteractive"
      data-domain={domain}
      src={scriptSrc}
    />
  );
}

"use client";

import { Analytics } from "@vercel/analytics/next";
import { useSyncExternalStore } from "react";

import {
  CONSENT_UPDATED_EVENT,
  hasAnalyticsConsent,
} from "@/lib/consent";

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

/**
 * Vercel Web Analytics (cookieless pageviews + visitors, visible in the
 * Vercel dashboard → Analytics). Mounted behind the same analytics consent
 * as Plausible so the two tools always measure the same population.
 */
export function VercelAnalytics() {
  const consented = useSyncExternalStore(
    subscribeToConsent,
    getConsent,
    getServerConsent,
  );

  if (!consented) {
    return null;
  }

  return <Analytics />;
}

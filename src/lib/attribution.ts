"use client";

import {
  CONSENT_UPDATED_EVENT,
  hasAnalyticsConsent,
  hasMarketingConsent,
} from "@/lib/consent";

export const ATTRIBUTION_STORAGE_KEY = "templify:attribution";
const ATTRIBUTION_TTL_DAYS = 90;

export type AttributionData = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_page?: string;
  captured_at: string;
};

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function hasAttributionConsent() {
  return hasAnalyticsConsent() || hasMarketingConsent();
}

function sanitize(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, 180);
}

function isExpired(capturedAt: string | null | undefined) {
  if (!capturedAt) {
    return true;
  }

  const captured = new Date(capturedAt).getTime();

  if (Number.isNaN(captured)) {
    return true;
  }

  return Date.now() - captured > ATTRIBUTION_TTL_DAYS * 24 * 60 * 60 * 1000;
}

export function readAttribution(): AttributionData | null {
  if (typeof window === "undefined" || !hasAttributionConsent()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AttributionData> | null;

    const capturedAt = parsed?.captured_at;

    if (!parsed || isExpired(capturedAt) || !capturedAt) {
      window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }

    return {
      utm_source: sanitize(parsed.utm_source),
      utm_medium: sanitize(parsed.utm_medium),
      utm_campaign: sanitize(parsed.utm_campaign),
      utm_content: sanitize(parsed.utm_content),
      utm_term: sanitize(parsed.utm_term),
      referrer: sanitize(parsed.referrer),
      landing_page: sanitize(parsed.landing_page),
      captured_at: capturedAt,
    };
  } catch {
    return null;
  }
}

export function captureAttributionFromLocation() {
  if (typeof window === "undefined" || !hasAttributionConsent()) {
    return null;
  }

  const url = new URL(window.location.href);
  const existing = readAttribution();
  const next: AttributionData = {
    ...(existing ?? {}),
    captured_at: existing?.captured_at ?? new Date().toISOString(),
  };
  let hasNewCampaignValue = false;

  for (const key of ATTRIBUTION_KEYS) {
    const value = sanitize(url.searchParams.get(key));

    if (value) {
      next[key] = value;
      hasNewCampaignValue = true;
    }
  }

  const referrer = sanitize(document.referrer);
  const sameOriginReferrer =
    referrer && referrer.startsWith(window.location.origin);

  if (!next.referrer && referrer && !sameOriginReferrer) {
    next.referrer = referrer;
  }

  if (!next.landing_page) {
    next.landing_page = `${url.pathname}${url.search}`.slice(0, 300);
  }

  if (!hasNewCampaignValue && existing) {
    return existing;
  }

  try {
    window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(next));
  } catch {
    return null;
  }

  return next;
}

export function subscribeToAttributionConsent(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(CONSENT_UPDATED_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CONSENT_UPDATED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

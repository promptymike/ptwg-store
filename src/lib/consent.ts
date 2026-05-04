export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

export const CONSENT_STORAGE_KEY = "templify-cookie-consent";
export const CONSENT_COOKIE_KEY = "templify_cookie_consent";
export const CONSENT_UPDATED_EVENT = "templify-consent-updated";

export function readConsentFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as Partial<ConsentState>;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent() {
  const consent = readConsentFromStorage();
  return Boolean(consent?.analytics);
}

export function hasMarketingConsent() {
  const consent = readConsentFromStorage();
  return Boolean(consent?.marketing);
}

// Lightweight affiliate tracking. Visitor lands with `?ref=CODE` →
// the code is captured into localStorage with a 30-day TTL and forwarded
// into Stripe checkout metadata so fulfillment can record the referral.
//
// We never trust an unrestricted code — the checkout endpoint validates
// against the `affiliates` table before persisting the metadata.

export const REF_STORAGE_KEY = "templify:affiliate-ref";
const REF_TTL_DAYS = 30;

export type AffiliateRef = {
  code: string;
  /** ISO timestamp the visitor first landed with this ref. */
  landedAt: string;
};

export function readAffiliateRef(): AffiliateRef | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REF_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AffiliateRef | null;
    if (!parsed?.code || !parsed?.landedAt) return null;
    const age = Date.now() - new Date(parsed.landedAt).getTime();
    if (age > REF_TTL_DAYS * 24 * 60 * 60 * 1000) {
      window.localStorage.removeItem(REF_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeAffiliateRef(code: string) {
  if (typeof window === "undefined") return;
  try {
    const normalised = code.trim().toUpperCase();
    if (!normalised || !/^[A-Z0-9_-]{3,40}$/.test(normalised)) return;
    window.localStorage.setItem(
      REF_STORAGE_KEY,
      JSON.stringify({
        code: normalised,
        landedAt: new Date().toISOString(),
      } satisfies AffiliateRef),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function clearAffiliateRef() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(REF_STORAGE_KEY);
  } catch {
    // ignore
  }
}

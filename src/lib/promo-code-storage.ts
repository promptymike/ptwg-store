// Client-side handoff of the applied promo code between the cart page and
// the checkout. localStorage (not state) so the code survives the full-page
// login redirect that sits between /koszyk and /checkout.

const PROMO_CODE_STORAGE_KEY = "ptwg.promo-code";

export function getStoredPromoCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(PROMO_CODE_STORAGE_KEY)?.trim();
    return value ? value : null;
  } catch {
    return null;
  }
}

export function setStoredPromoCode(code: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROMO_CODE_STORAGE_KEY, code.trim().toUpperCase());
  } catch {
    // Private mode / storage quota — the user just re-types the code at checkout.
  }
}

export function clearStoredPromoCode() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

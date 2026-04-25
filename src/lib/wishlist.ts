// Localstorage-only wishlist. Survives reloads and cross-tab activity but
// stays anonymous — nothing leaves the buyer's browser. Easy to upgrade
// to a server-synced wishlist later by mirroring writes into a
// `wishlist_items` table when the user is logged in.

export const WISHLIST_STORAGE_KEY = "templify:wishlist";
export const WISHLIST_EVENT = "templify-wishlist-updated";

export type WishlistEntry = {
  productId: string;
  addedAt: string;
};

export function readWishlist(): WishlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is WishlistEntry =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as WishlistEntry).productId === "string",
    );
  } catch {
    return [];
  }
}

export function writeWishlist(entries: WishlistEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event(WISHLIST_EVENT));
  } catch {
    // private mode / quota — skip silently
  }
}

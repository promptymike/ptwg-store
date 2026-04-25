"use client";

import { useEffect, useRef } from "react";

import { syncWishlistAction } from "@/app/actions/wishlist";
import { readWishlist, writeWishlist } from "@/lib/wishlist";

const SYNC_FLAG_KEY = "templify:wishlist-synced";

/**
 * Mounted once per session in the (store) layout for logged-in users.
 * Merges the browser's localStorage wishlist with the user's saved
 * wishlist on the server so hearts follow them across devices. Runs at
 * most once per session via a sessionStorage flag — refreshing the page
 * doesn't re-sync.
 */
export function WishlistSync() {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SYNC_FLAG_KEY) === "1") return;
    ranRef.current = true;

    const local = readWishlist();
    const ids = local.map((entry) => entry.productId);

    syncWishlistAction(ids)
      .then((result) => {
        if (!result?.ids) return;
        const incomingSet = new Set(result.ids);
        const localSet = new Set(ids);
        const equal =
          incomingSet.size === localSet.size &&
          [...incomingSet].every((id) => localSet.has(id));
        if (!equal) {
          // Preserve original addedAt for IDs we already had locally; new
          // server-only IDs get a fresh timestamp so they sort last.
          const byId = new Map(local.map((entry) => [entry.productId, entry]));
          const merged = result.ids.map(
            (id) =>
              byId.get(id) ?? {
                productId: id,
                addedAt: new Date().toISOString(),
              },
          );
          writeWishlist(merged);
        }
        window.sessionStorage.setItem(SYNC_FLAG_KEY, "1");
      })
      .catch(() => {
        // best-effort; localStorage stays as the source of truth on failure
      });
  }, []);

  return null;
}

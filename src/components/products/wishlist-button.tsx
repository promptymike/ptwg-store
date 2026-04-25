"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";

import {
  type WishlistEntry,
  WISHLIST_EVENT,
  readWishlist,
  writeWishlist,
} from "@/lib/wishlist";

let cachedRaw: string | null = "";
let cachedSnapshot: WishlistEntry[] = [];

function getSnapshot(): WishlistEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem("templify:wishlist");
  if (raw === cachedRaw) return cachedSnapshot;
  cachedRaw = raw;
  cachedSnapshot = readWishlist();
  return cachedSnapshot;
}

function getServerSnapshot(): WishlistEntry[] {
  return [];
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onChange);
  window.addEventListener(WISHLIST_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(WISHLIST_EVENT, onChange);
  };
}

type WishlistButtonProps = {
  productId: string;
  productName: string;
  className?: string;
};

export function WishlistButton({
  productId,
  productName,
  className,
}: WishlistButtonProps) {
  const wishlist = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isOnList = wishlist.some((entry) => entry.productId === productId);

  function toggle() {
    const current = readWishlist();
    if (isOnList) {
      writeWishlist(current.filter((entry) => entry.productId !== productId));
    } else {
      writeWishlist([
        ...current,
        { productId, addedAt: new Date().toISOString() },
      ]);
    }
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle();
      }}
      aria-pressed={isOnList}
      aria-label={
        isOnList
          ? `Usuń ${productName} z listy życzeń`
          : `Dodaj ${productName} do listy życzeń`
      }
      className={`inline-flex size-9 items-center justify-center rounded-full border transition ${
        isOnList
          ? "border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
          : "border-border/70 bg-background/80 text-muted-foreground hover:border-rose-500/30 hover:text-rose-500"
      } ${className ?? ""}`}
    >
      <Heart
        className={`size-4 transition ${isOnList ? "fill-current" : ""}`}
      />
    </button>
  );
}

/**
 * Subscribe-only hook for components that need to react to wishlist
 * changes without rendering the toggle button (e.g. the wishlist page).
 */
export function useWishlistSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

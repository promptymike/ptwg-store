"use client";

import { useEffect } from "react";

import { writeAffiliateRef } from "@/lib/affiliate";

/**
 * Mounts in the (store) layout so any landing on the site captures a
 * `?ref=` code into localStorage. Bounded to one read on mount — we
 * don't strip the param from the URL because it's harmless and lets
 * the affiliate verify the link they shared.
 */
export function AffiliateCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("ref");
    if (code) writeAffiliateRef(code);
  }, []);
  return null;
}

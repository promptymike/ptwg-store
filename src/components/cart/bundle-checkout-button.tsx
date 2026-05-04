"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LibraryBig, Loader2, ShoppingBag } from "lucide-react";

import { useAnalytics } from "@/components/analytics/analytics-provider";
import { Button } from "@/components/ui/button";
import { readAffiliateRef } from "@/lib/affiliate";
import { readAttribution } from "@/lib/attribution";
import {
  BUNDLE_CTA_COPY,
  BUNDLE_CTA_EXPERIMENT,
  pickVariant,
} from "@/lib/experiments";

type BundleCheckoutButtonProps = {
  bundleId: string;
  bundleName: string;
  price: number;
  /** When the buyer already owns every product in the pack the CTA flips
   *  to a "you already have this" link instead of opening Stripe. */
  allOwned?: boolean;
};

export function BundleCheckoutButton({
  bundleId,
  bundleName,
  allOwned,
}: BundleCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const variant = pickVariant(BUNDLE_CTA_EXPERIMENT);
  const { track } = useAnalytics();
  const reportedRef = useRef(false);

  useEffect(() => {
    if (reportedRef.current || allOwned) return;
    reportedRef.current = true;
    track("page_view", {
      experiment: BUNDLE_CTA_EXPERIMENT.key,
      variant,
      surface: "bundle_cta_impression",
      bundleId,
    });
  }, [track, variant, bundleId, allOwned]);

  if (allOwned) {
    return (
      <Button
        variant="outline"
        className="w-full"
        render={<Link href="/biblioteka" />}
      >
        <LibraryBig className="size-4" />
        Masz już wszystkie pozycje
      </Button>
    );
  }

  async function handleClick() {
    track("begin_checkout", {
      experiment: BUNDLE_CTA_EXPERIMENT.key,
      variant,
      surface: "bundle_cta_click",
      bundleId,
      bundle_id: bundleId,
      bundle_name: bundleName,
      currency: "PLN",
    });
    setError(null);
    setIsLoading(true);
    try {
      const ref = readAffiliateRef()?.code;
      const url = ref
        ? `/api/checkout/bundle/${bundleId}?ref=${encodeURIComponent(ref)}`
        : `/api/checkout/bundle/${bundleId}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attribution: readAttribution() ?? undefined,
        }),
      });
      const payload = (await response
        .json()
        .catch(() => null)) as { url?: string; message?: string; code?: string } | null;
      if (!response.ok || !payload?.url) {
        if (payload?.code === "unauthenticated") {
          window.location.href = `/logowanie?next=${encodeURIComponent(
            "/#bundles",
          )}`;
          return;
        }
        setError(
          payload?.message ??
            "Nie udało się rozpocząć płatności. Spróbuj ponownie.",
        );
        setIsLoading(false);
        return;
      }
      window.location.href = payload.url;
    } catch {
      setError("Wystąpił błąd sieci. Spróbuj ponownie.");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        size="lg"
        onClick={handleClick}
        disabled={isLoading}
        aria-label={`Kup ${bundleName}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Przekierowanie do Stripe…
          </>
        ) : (
          <>
            <ShoppingBag className="size-4" />
            {BUNDLE_CTA_COPY[variant]}
          </>
        )}
      </Button>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

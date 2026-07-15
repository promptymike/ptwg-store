"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LibraryBig, Loader2, ShoppingBag } from "lucide-react";

import { useAnalytics } from "@/components/analytics/analytics-provider";
import { Button } from "@/components/ui/button";
import { readAffiliateRef } from "@/lib/affiliate";
import { readAttribution } from "@/lib/attribution";
import {
  BUNDLE_CTA_EXPERIMENT,
  pickVariant,
} from "@/lib/experiments";
import {
  PURCHASES_ENABLED,
  PURCHASES_UNAVAILABLE_MESSAGE,
} from "@/lib/purchase-availability";

type BundleCheckoutButtonProps = {
  bundleId: string;
  bundleName: string;
  price: number;
  /** When the buyer already owns every product in the pack the CTA flips
   *  to a "you already have this" link instead of opening payment. */
  allOwned?: boolean;
};

export function BundleCheckoutButton({
  bundleId,
  bundleName,
  price,
  allOwned,
}: BundleCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
        className="w-full border-stone-950/10 bg-stone-100 text-stone-950 hover:bg-stone-200"
        render={<Link href="/biblioteka" />}
      >
        <LibraryBig className="size-4" />
        Masz już wszystkie pozycje
      </Button>
    );
  }

  if (!PURCHASES_ENABLED) {
    return (
      <div className="space-y-2">
        <Button
          className="w-full border-stone-950/10 bg-stone-200 text-stone-500"
          size="lg"
          disabled
          title={PURCHASES_UNAVAILABLE_MESSAGE}
        >
          <ShoppingBag className="size-4" />
          Zakupy chwilowo niedostępne
        </Button>
        <p className="text-xs leading-5 text-stone-500">
          {PURCHASES_UNAVAILABLE_MESSAGE}
        </p>
      </div>
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
          digitalDeliveryConsent: acceptedTerms,
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
    <div className="space-y-3">
      <div className="space-y-1.5 rounded-2xl border border-stone-950/10 bg-white/55 p-3 text-xs text-stone-600">
        <div className="flex items-center justify-between">
          <span>Pakiet</span>
          <span>{price.toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Dostawa cyfrowa</span>
          <span>0,00 zł</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>Podatek VAT</span>
          <span className="text-right">Nie doliczono (zwolnienie)</span>
        </div>
        <div className="flex items-center justify-between border-t border-stone-950/10 pt-1.5 font-semibold text-stone-950">
          <span>Do zapłaty</span>
          <span>{price.toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}</span>
        </div>
      </div>
      <label className="flex items-start gap-2.5 text-xs leading-5 text-stone-600">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-stone-950"
        />
        <span>
          Akceptuję <Link href="/regulamin" target="_blank" className="font-semibold text-stone-950 underline underline-offset-2">Regulamin</Link> i żądam natychmiastowej dostawy cyfrowej, przyjmując do wiadomości utratę prawa odstąpienia po uzyskaniu dostępu.
        </span>
      </label>
      <Button
        className="w-full border-stone-950 bg-stone-950 text-[#fff] shadow-[0_18px_45px_-28px_rgba(20,16,10,.8)] hover:bg-stone-800"
        size="lg"
        onClick={handleClick}
        disabled={isLoading || !acceptedTerms}
        aria-label={`Kup ${bundleName}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Przekierowanie do płatności…
          </>
        ) : (
          <>
            <ShoppingBag className="size-4" />
            Kupuję i płacę
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

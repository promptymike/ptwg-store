"use client";

import Link from "next/link";
import { useState } from "react";
import { LibraryBig, Loader2, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";

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
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/checkout/bundle/${bundleId}`, {
        method: "POST",
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
            Kup pakiet
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

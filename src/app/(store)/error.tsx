"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { reportClientError } from "@/components/analytics/error-reporter";
import { Button } from "@/components/ui/button";

type StoreErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Storefront error boundary: without it a client-side crash leaves the
// visitor on a dead page with nothing to click — the worst possible state
// for a shop. Always offer a one-tap recovery.
export default function StoreError({ error, reset }: StoreErrorProps) {
  useEffect(() => {
    reportClientError({
      message: error.message || "render crash",
      stack: error.stack,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="shell section-space">
      <div className="surface-panel mx-auto flex max-w-2xl flex-col items-start gap-5 p-8 sm:p-12">
        <span className="eyebrow">Ups — coś poszło nie tak</span>
        <div className="space-y-3">
          <h1 className="text-3xl text-foreground sm:text-4xl">
            Ta strona się wysypała, ale Twoje konto i zakupy są bezpieczne.
          </h1>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            Spróbuj odświeżyć — zwykle to wystarcza. Jeśli błąd wraca, napisz do
            nas przez formularz kontaktowy, a szybko to naprawimy.
          </p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground">
              Kod błędu: <code>{error.digest}</code>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={reset}>
            <RotateCcw className="size-4" />
            Spróbuj ponownie
          </Button>
          <Button variant="outline" render={<Link href="/" />}>
            Strona główna
          </Button>
          <Button variant="outline" render={<Link href="/kontakt" />}>
            Zgłoś problem
          </Button>
        </div>
      </div>
    </div>
  );
}

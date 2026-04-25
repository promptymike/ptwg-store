import type { Metadata } from "next";
import Link from "next/link";
import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Płatność anulowana",
  robots: { index: false, follow: false },
};

export default function GiftCancelledPage() {
  return (
    <div className="shell section-space">
      <section className="surface-panel mx-auto max-w-2xl space-y-5 p-8 text-center sm:p-10">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <CircleAlert className="size-6" />
        </span>
        <h1 className="text-3xl text-foreground sm:text-4xl">
          Płatność anulowana
        </h1>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
          Voucher nie został zakupiony. Możesz wrócić do formularza i spróbować
          ponownie albo wybrać inną kwotę. Nic nie zostało pobrane z Twojej
          karty.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button render={<Link href="/podarunek" />}>Wróć do vouchera</Button>
          <Button variant="outline" render={<Link href="/" />}>
            Strona główna
          </Button>
        </div>
      </section>
    </div>
  );
}

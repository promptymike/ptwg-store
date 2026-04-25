import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Voucher kupiony",
  robots: { index: false, follow: false },
};

export default function GiftSuccessPage() {
  return (
    <div className="shell section-space">
      <section className="surface-panel mx-auto max-w-2xl space-y-5 p-8 text-center sm:p-10">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="size-6" />
        </span>
        <h1 className="text-3xl text-foreground sm:text-4xl">
          Płatność zatwierdzona — kod jest w drodze.
        </h1>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
          W ciągu 1-2 minut wyślemy maila z unikalnym kodem GIFT-XXXX. Jeśli
          podałaś/eś też e-mail osoby obdarowanej, dostanie ona swój egzemplarz
          z dedykacją.
        </p>
        <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-left text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-2 text-foreground">
            <Mail className="size-4 text-primary" />
            Nie widzisz maila po 5 minutach?
          </p>
          <p className="mt-1 text-xs">
            Sprawdź folder spam / oferty. Jeśli dalej brak — napisz na{" "}
            <a
              className="text-primary underline-offset-4 hover:underline"
              href="mailto:kontakt@templify.store"
            >
              kontakt@templify.store
            </a>
            , odsyłamy kod ręcznie.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button render={<Link href="/produkty" />}>Przeglądaj katalog</Button>
          <Button variant="outline" render={<Link href="/podarunek" />}>
            Kup kolejny voucher
          </Button>
        </div>
      </section>
    </div>
  );
}

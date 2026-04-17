import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="shell section-space">
      <div className="surface-panel gold-frame flex flex-col items-start gap-5 p-8 sm:p-12">
        <span className="eyebrow">404 • Nie znaleziono strony</span>
        <div className="space-y-3">
          <h1 className="text-4xl text-white sm:text-5xl">
            Ta ścieżka nie prowadzi do produktu.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Sprawdź katalog lub wróć na stronę główną. Wszystkie placeholdery i
            strony produktowe są już spięte w nowej strukturze App Router.
          </p>
        </div>
        <Button render={<Link href="/produkty" />}>Przejdź do katalogu</Button>
      </div>
    </div>
  );
}

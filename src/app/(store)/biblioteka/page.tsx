import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/session";
import { getLibrarySnapshot } from "@/lib/supabase/store";

export default async function LibraryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/logowanie");
  }

  const items = await getLibrarySnapshot(user.id);

  if (items.length === 0) {
    return (
      <div className="shell section-space">
        <EmptyState
          badge="Moja biblioteka"
          title="Biblioteka jest jeszcze pusta"
          description="Po zapisaniu pierwszych zakupów w Supabase tutaj pojawią się prawdziwe rekordy biblioteki i linki do pobrania plików cyfrowych."
          action={{ href: "/produkty", label: "Wróć do zakupów" }}
        />
      </div>
    );
  }

  return (
    <div className="shell section-space space-y-6">
      <div className="space-y-3">
        <span className="eyebrow">Moja biblioteka</span>
        <div>
          <h1 className="text-4xl text-white sm:text-5xl">Twoje produkty cyfrowe</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Lista korzysta z tabeli `library_items`, a pobrania są gotowe pod signed
            URL z prywatnego bucketa `product-files`.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="surface-panel gold-frame flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-primary/75">
                {item.category}
              </p>
              <h2 className="text-2xl text-white">{item.name}</h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {item.shortDescription}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-primary/70">
                {item.format} • dodano{" "}
                {new Date(item.createdAt).toLocaleDateString("pl-PL")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/produkty/${item.slug}`}
                className="rounded-full border border-border/70 bg-secondary/50 px-5 py-3 text-sm font-semibold text-white transition hover:border-primary/30"
              >
                Zobacz produkt
              </Link>
              {item.filePath ? (
                <Link
                  href={`/api/library/${item.productId}/download`}
                  className="rounded-full border border-primary/30 bg-primary/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/18"
                >
                  Pobierz plik
                </Link>
              ) : (
                <span className="rounded-full border border-border/70 bg-secondary/50 px-5 py-3 text-sm font-semibold text-muted-foreground">
                  Plik nie został jeszcze dodany
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

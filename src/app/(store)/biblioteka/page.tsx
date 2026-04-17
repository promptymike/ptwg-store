import Link from "next/link";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/session";
import { getLibrarySnapshot } from "@/lib/supabase/store";

type LibraryPageProps = {
  searchParams: Promise<{
    type?: string;
    message?: string;
  }>;
};

function LibraryNotice({
  type,
  message,
}: {
  type?: string;
  message?: string;
}) {
  if (!type || !message) {
    return null;
  }

  const isSuccess = type === "success";

  return (
    <div
      className={`rounded-[1.4rem] border p-4 text-sm ${
        isSuccess
          ? "border-primary/20 bg-primary/10 text-muted-foreground"
          : "border-destructive/30 bg-destructive/10 text-white/90"
      }`}
    >
      {message}
    </div>
  );
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const [user, status] = await Promise.all([getCurrentUser(), searchParams]);

  if (!user) {
    redirect("/logowanie?next=/biblioteka");
  }

  const items = await getLibrarySnapshot(user.id);

  if (items.length === 0) {
    return (
      <div className="shell section-space space-y-6">
        <LibraryNotice type={status.type} message={status.message} />
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
      <LibraryNotice type={status.type} message={status.message} />

      <div className="space-y-3">
        <span className="eyebrow">Moja biblioteka</span>
        <div>
          <h1 className="text-4xl text-white sm:text-5xl">Twoje produkty cyfrowe</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Lista korzysta z tabeli `library_items`, a pobrania działają przez signed URL z prywatnego bucketa `product-files`.
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
                {item.format} • dodano {new Date(item.createdAt).toLocaleDateString("pl-PL")}
              </p>
              <p className="text-xs text-muted-foreground">
                Pobrania: {item.downloadCount}
                {item.lastDownloadedAt
                  ? ` • ostatnio ${new Date(item.lastDownloadedAt).toLocaleDateString("pl-PL")}`
                  : " • jeszcze nie pobrano"}
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

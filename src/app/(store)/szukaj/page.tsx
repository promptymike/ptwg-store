import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, NotebookText, SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatCurrency } from "@/lib/format";
import { findSearchResults } from "@/lib/search";

export const metadata: Metadata = {
  title: "Wyniki wyszukiwania",
  robots: { index: false, follow: false },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (query.length < 2) {
    return (
      <div className="shell section-space">
        <EmptyState
          icon={SearchX}
          badge="Szukaj"
          title="Wpisz minimum 2 znaki"
          description="Użyj ikony szukania w nagłówku albo wpisz frazę w adresie ?q="
          action={{ href: "/produkty", label: "Wróć do katalogu" }}
        />
      </div>
    );
  }

  const { products, blog: posts } = await findSearchResults(query, {
    productLimit: 40,
    blogLimit: 20,
  });
  const total = products.length + posts.length;

  return (
    <div className="shell section-space space-y-8">
      <SectionHeading
        badge="Wyniki wyszukiwania"
        title={`„${query}” — ${total} ${total === 1 ? "wynik" : "wyników"}`}
        description="Szukamy w nazwach, opisach, kategoriach, tagach i typach produktów oraz w treści wpisów na blogu."
        as="h1"
      />

      {total === 0 ? (
        <EmptyState
          icon={SearchX}
          badge="Brak wyników"
          title={`Nic dla „${query}”`}
          description="Spróbuj krótszej frazy albo przeglądnij katalog ręcznie."
          action={{ href: "/produkty", label: "Otwórz katalog" }}
          secondaryAction={{ href: "/test", label: "Zrób test dopasowania" }}
        />
      ) : (
        <div className="space-y-10">
          {products.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-2xl text-foreground">
                Produkty ({products.length})
              </h2>
              <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={product.href}
                      className="surface-panel group flex h-full flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <BookOpen className="size-4" />
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-primary/75">
                          {product.category ?? "Produkt"}
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {product.title}
                      </p>
                      {product.excerpt ? (
                        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {product.excerpt}
                        </p>
                      ) : null}
                      <div className="mt-auto flex items-center justify-between text-sm">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-primary transition group-hover:gap-1.5">
                          Otwórz
                          <ArrowUpRight className="size-3.5" />
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {posts.length > 0 ? (
            <section className="space-y-4">
              <h2 className="text-2xl text-foreground">
                Blog ({posts.length})
              </h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={post.href}
                      className="surface-panel group flex h-full flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <NotebookText className="size-4" />
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-primary/75">
                          Wpis
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">
                        {post.title}
                      </p>
                      {post.excerpt ? (
                        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

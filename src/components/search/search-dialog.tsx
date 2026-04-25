"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Loader2,
  NotebookText,
  Search,
  X,
} from "lucide-react";

import { formatCurrency } from "@/lib/format";

type SearchResult = {
  query: string;
  products: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string | null;
    price: number;
    href: string;
  }>;
  blog: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    href: string;
  }>;
};

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      // Clearing here keeps a stale "Iphone" result list from showing
      // after the user backspaces to "I". Wrapped in queueMicrotask so
      // the React Compiler treats this as a side-effect update, not a
      // synchronous-setState pattern (the lint rule trips otherwise).
      queueMicrotask(() => {
        setResults(null);
        setIsPending(false);
      });
      return;
    }
    queueMicrotask(() => setIsPending(true));
    const controller = new AbortController();
    const handle = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? (res.json() as Promise<SearchResult>) : null))
        .then((data) => {
          if (data) setResults(data);
        })
        .catch(() => {})
        .finally(() => setIsPending(false));
    }, 200);
    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [query, open]);

  function navigateToFullResults() {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    router.push(`/szukaj?q=${encodeURIComponent(trimmed)}`);
    onClose();
  }

  if (!open) return null;

  const hasResults =
    Boolean(results) &&
    ((results?.products.length ?? 0) > 0 || (results?.blog.length ?? 0) > 0);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-stone-950/55 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Szukaj na stronie"
        className="absolute inset-x-0 top-12 mx-auto w-full max-w-2xl px-4"
      >
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_40px_100px_-30px_rgba(0,0,0,0.55)] animate-in fade-in slide-in-from-top-3 duration-200">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              navigateToFullResults();
            }}
            className="flex items-center gap-3 border-b border-border/60 px-4 py-3"
          >
            <Search className="size-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj ebooka albo wpisu na blogu..."
              className="flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
              aria-label="Szukaj"
            />
            {isPending ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij szukanie"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </form>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.trim().length < 2 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Wpisz minimum 2 znaki, by zacząć szukać.
              </p>
            ) : !hasResults && !isPending ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Nic nie znaleziono dla &bdquo;{query}&rdquo;.
                <br />
                <Link
                  href="/produkty"
                  onClick={onClose}
                  className="mt-2 inline-flex items-center gap-1 text-primary hover:text-primary/80"
                >
                  Zobacz cały katalog
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4 p-2">
                {(results?.products.length ?? 0) > 0 ? (
                  <div>
                    <p className="px-2 text-[11px] uppercase tracking-[0.18em] text-primary/75">
                      Produkty
                    </p>
                    <ul className="mt-1 space-y-1">
                      {results!.products.map((hit) => (
                        <li key={hit.id}>
                          <Link
                            href={hit.href}
                            onClick={onClose}
                            className="group flex items-start gap-3 rounded-2xl px-3 py-2 transition hover:bg-secondary"
                          >
                            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <BookOpen className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block break-words font-semibold text-foreground">
                                {hit.title}
                              </span>
                              <span className="line-clamp-1 break-words text-xs text-muted-foreground">
                                {hit.category ? `${hit.category} · ` : ""}
                                {hit.excerpt}
                              </span>
                            </span>
                            <span className="shrink-0 text-sm font-semibold text-foreground tabular-nums">
                              {formatCurrency(hit.price)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {(results?.blog.length ?? 0) > 0 ? (
                  <div>
                    <p className="px-2 text-[11px] uppercase tracking-[0.18em] text-primary/75">
                      Blog
                    </p>
                    <ul className="mt-1 space-y-1">
                      {results!.blog.map((hit) => (
                        <li key={hit.id}>
                          <Link
                            href={hit.href}
                            onClick={onClose}
                            className="group flex items-start gap-3 rounded-2xl px-3 py-2 transition hover:bg-secondary"
                          >
                            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <NotebookText className="size-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block break-words font-semibold text-foreground">
                                {hit.title}
                              </span>
                              <span className="line-clamp-1 break-words text-xs text-muted-foreground">
                                {hit.excerpt}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {query.trim().length >= 2 && hasResults ? (
            <div className="border-t border-border/60 bg-background/40 px-4 py-3">
              <button
                type="button"
                onClick={navigateToFullResults}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary/80"
              >
                Zobacz wszystkie wyniki
                <ArrowRight className="size-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, Download, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAdminDate } from "@/lib/format";
import { getCoverImageOverlayOpacity } from "@/lib/product";
import type { LibraryItemSnapshot } from "@/lib/supabase/store";

type LibraryGridProps = {
  items: LibraryItemSnapshot[];
};

type ProgressMap = Record<string, number>;

const PROGRESS_KEY_PREFIX = "templify:reading-progress:";
const OPENED_KEY_PREFIX = "templify:reading-opened:";
const PROGRESS_REFRESH_EVENT = "templify:reading-progress-updated";

function readAllProgress(productIds: string[]): ProgressMap {
  if (typeof window === "undefined") return {};
  const map: ProgressMap = {};
  for (const id of productIds) {
    const raw = window.localStorage.getItem(`${PROGRESS_KEY_PREFIX}${id}`);
    if (!raw) continue;
    const value = Number.parseFloat(raw);
    if (Number.isFinite(value) && value > 0) {
      map[id] = Math.min(100, Math.max(0, Math.round(value)));
    }
  }
  return map;
}

function readAllOpenedAt(productIds: string[]): Record<string, number> {
  if (typeof window === "undefined") return {};
  const map: Record<string, number> = {};
  for (const id of productIds) {
    const raw = window.localStorage.getItem(`${OPENED_KEY_PREFIX}${id}`);
    if (!raw) continue;
    const value = Number.parseInt(raw, 10);
    if (Number.isFinite(value) && value > 0) {
      map[id] = value;
    }
  }
  return map;
}

export function LibraryGrid({ items }: LibraryGridProps) {
  const productIds = items.map((item) => item.productId);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [openedAt, setOpenedAt] = useState<Record<string, number>>({});

  useEffect(() => {
    function refresh() {
      setProgress(readAllProgress(productIds));
      setOpenedAt(readAllOpenedAt(productIds));
    }
    refresh();
    // Other tabs (the in-browser reader) update localStorage in the
    // background; the storage event lets the library reflect that
    // without a full page refresh.
    const handleStorage = (event: StorageEvent) => {
      if (
        !event.key ||
        (!event.key.startsWith(PROGRESS_KEY_PREFIX) &&
          !event.key.startsWith(OPENED_KEY_PREFIX))
      ) {
        return;
      }
      refresh();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener(PROGRESS_REFRESH_EVENT, refresh as EventListener);
    // Re-check when the user comes back to this tab.
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        PROGRESS_REFRESH_EVENT,
        refresh as EventListener,
      );
      document.removeEventListener("visibilitychange", refresh);
    };
    // productIds is derived from items each render but the values are
    // stable per library entry, so it is intentionally not in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <div className="grid gap-5">
      {items.map((item) => {
        const coverOverlayOpacity = getCoverImageOverlayOpacity(item);
        const productProgress = progress[item.productId] ?? 0;
        const productOpenedAt = openedAt[item.productId];
        const hasProgress = productProgress > 0;
        const hasOpened = !!productOpenedAt || hasProgress;

        return (
          <article
            key={item.id}
            className="surface-panel overflow-hidden border-border/70 bg-background/70 transition hover:border-primary/30"
          >
            <div className="grid gap-0 lg:grid-cols-[240px_minmax(0,1fr)]">
              <Link
                href={`/produkty/${item.slug}`}
                className={`relative min-h-[190px] overflow-hidden bg-gradient-to-br ${item.coverGradient} p-5 transition hover:brightness-105 sm:min-h-[220px]`}
              >
                <div className="hero-orb right-4 top-4 size-16 bg-white/35" />
                <div className="hero-orb bottom-4 left-4 size-14 bg-primary/18" />

                {item.coverImageUrl && coverOverlayOpacity > 0 ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage: `url(${item.coverImageUrl})`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                      opacity: coverOverlayOpacity,
                    }}
                  />
                ) : null}

                {/* High-contrast bottom gradient so the title stays
                    legible on every cover, in any theme. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-stone-950/35 via-stone-950/10 to-transparent"
                />

                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between gap-3">
                    <Badge className="border-0 bg-stone-950/85 font-semibold uppercase tracking-[0.18em] text-stone-50 backdrop-blur-sm">
                      {item.category}
                    </Badge>
                    {item.updateLabel ? (
                      <Badge
                        variant="outline"
                        className="border-stone-950/15 bg-stone-50/95 font-semibold text-stone-900"
                      >
                        {item.updateLabel}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-900/85 [text-shadow:0_1px_0_rgba(255,255,255,0.4)]">
                      {item.format}
                    </p>
                    <p className="line-clamp-3 max-w-[11rem] break-words font-heading text-2xl font-semibold text-stone-950 [text-shadow:0_1px_0_rgba(255,255,255,0.5)]">
                      {item.name}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="flex min-w-0 flex-col justify-between gap-6 p-5 sm:p-6">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-primary/20 bg-primary/10 text-primary"
                      >
                        Kupione
                      </Badge>
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        zakup {formatAdminDate(item.createdAt)}
                      </span>
                      {hasProgress ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        >
                          {productProgress >= 95
                            ? "Przeczytane"
                            : `${productProgress}% przeczytane`}
                        </Badge>
                      ) : hasOpened ? (
                        <Badge
                          variant="outline"
                          className="border-border/70 bg-background/70 text-muted-foreground"
                        >
                          Otwierane
                        </Badge>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/produkty/${item.slug}`}
                        className="flex items-start gap-2 text-2xl text-foreground transition hover:text-primary"
                      >
                        <span className="line-clamp-2 min-w-0 break-words">
                          {item.name}
                        </span>
                        <ArrowUpRight className="size-4 shrink-0 translate-y-1.5" />
                      </Link>
                      <p className="mt-3 line-clamp-3 max-w-3xl break-words text-sm leading-7 text-muted-foreground">
                        {item.shortDescription}
                      </p>
                    </div>
                    {hasProgress ? (
                      <div className="space-y-1.5">
                        <div
                          className="h-1.5 w-full overflow-hidden rounded-full bg-background/70"
                          aria-hidden
                        >
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                            style={{ width: `${productProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Przewinięte do {productProgress}% — wrócisz tam,
                          gdy znów otworzysz ebook.
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                        Format
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {item.format}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                        Pobrania
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {item.downloadCount}
                      </p>
                    </div>
                    <div className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                        Ostatnia aktywność
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        {item.lastDownloadedAt
                          ? formatAdminDate(item.lastDownloadedAt)
                          : productOpenedAt
                            ? formatAdminDate(
                                new Date(productOpenedAt).toISOString(),
                              )
                            : "Jeszcze nie otwierane"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {item.filePath ? (
                    <>
                      <Button
                        size="lg"
                        className="w-full sm:w-auto"
                        render={
                          <a
                            href={`/api/library/${item.productId}/read`}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <BookOpen className="size-4" />
                        {hasProgress ? "Wróć do czytania" : "Otwórz w przeglądarce"}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto"
                        render={
                          <Link
                            href={`/api/library/${item.productId}/download`}
                          />
                        }
                      >
                        <Download className="size-4" />
                        Pobierz plik
                      </Button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-5 py-3 text-sm font-semibold text-muted-foreground">
                      <Sparkles className="size-4" />
                      Plik będzie dostępny wkrótce
                    </span>
                  )}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

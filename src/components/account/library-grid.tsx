"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  Download,
  Sparkles,
} from "lucide-react";

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
  const productIds = useMemo(
    () => items.map((item) => item.productId),
    [items],
  );
  const [progress, setProgress] = useState<ProgressMap>({});
  const [openedAt, setOpenedAt] = useState<Record<string, number>>({});

  useEffect(() => {
    function refresh() {
      setProgress(readAllProgress(productIds));
      setOpenedAt(readAllOpenedAt(productIds));
    }
    refresh();
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
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        PROGRESS_REFRESH_EVENT,
        refresh as EventListener,
      );
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [productIds]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aOpened = openedAt[a.productId] ?? 0;
      const bOpened = openedAt[b.productId] ?? 0;
      if (aOpened !== bOpened) return bOpened - aOpened;
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [items, openedAt]);

  const continueReading = useMemo(() => {
    const candidates = sortedItems.filter(
      (item) =>
        item.filePath &&
        (progress[item.productId] ?? 0) > 0 &&
        (progress[item.productId] ?? 0) < 95,
    );
    return candidates[0] ?? null;
  }, [sortedItems, progress]);

  const restItems = useMemo(
    () => sortedItems.filter((item) => item.id !== continueReading?.id),
    [sortedItems, continueReading],
  );

  return (
    <div className="space-y-6">
      {continueReading ? (
        <ContinueReadingCard
          item={continueReading}
          progressValue={progress[continueReading.productId] ?? 0}
          openedAt={openedAt[continueReading.productId]}
        />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {restItems.map((item) => (
          <LibraryCard
            key={item.id}
            item={item}
            progressValue={progress[item.productId] ?? 0}
            openedAt={openedAt[item.productId]}
          />
        ))}
      </div>
    </div>
  );
}

function ContinueReadingCard({
  item,
  progressValue,
  openedAt,
}: {
  item: LibraryItemSnapshot;
  progressValue: number;
  openedAt: number | undefined;
}) {
  const coverOverlayOpacity = getCoverImageOverlayOpacity(item);
  return (
    <article className="surface-panel group relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-background/70 to-background/70 transition hover:border-primary/50">
      <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Link
          href={`/api/library/${item.productId}/read`}
          target="_blank"
          rel="noopener noreferrer"
          className={`relative isolate min-h-[220px] overflow-hidden bg-gradient-to-br ${item.coverGradient} p-5 sm:min-h-[260px]`}
        >
          {item.coverImageUrl && coverOverlayOpacity > 0 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: `url(${item.coverImageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                opacity: coverOverlayOpacity,
              }}
            />
          ) : null}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-stone-950/40 via-stone-950/10 to-transparent"
          />
          <div className="relative flex h-full flex-col justify-between">
            <Badge className="self-start border-0 bg-stone-950/85 font-semibold uppercase tracking-[0.18em] text-stone-50 backdrop-blur-sm">
              W trakcie czytania
            </Badge>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-900/85 [text-shadow:0_1px_0_rgba(255,255,255,0.4)]">
                {item.format}
              </p>
              <p className="line-clamp-3 max-w-[14rem] break-words font-heading text-2xl font-semibold text-stone-950 [text-shadow:0_1px_0_rgba(255,255,255,0.5)]">
                {item.name}
              </p>
            </div>
          </div>
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1.5 bg-stone-950/20"
          >
            <div
              className="h-full bg-primary transition-[width] duration-300"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </Link>

        <div className="flex flex-col justify-between gap-5 p-6 sm:p-8">
          <div className="space-y-3">
            <span className="eyebrow">Wróć tam, gdzie skończyłeś</span>
            <Link
              href={`/produkty/${item.slug}`}
              className="block text-3xl text-foreground transition hover:text-primary"
            >
              {item.name}
            </Link>
            <p className="line-clamp-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              {item.shortDescription}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-background/70"
                aria-hidden
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {progressValue}%
              </span>
            </div>
            {openedAt ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                ostatnio otwierane{" "}
                {formatAdminDate(new Date(openedAt).toISOString())}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
              Wróć do czytania
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              render={<Link href={`/api/library/${item.productId}/download`} />}
            >
              <Download className="size-4" />
              Pobierz plik
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function LibraryCard({
  item,
  progressValue,
  openedAt,
}: {
  item: LibraryItemSnapshot;
  progressValue: number;
  openedAt: number | undefined;
}) {
  const coverOverlayOpacity = getCoverImageOverlayOpacity(item);
  const hasProgress = progressValue > 0;
  const isFinished = progressValue >= 95;
  const hasOpened = !!openedAt || hasProgress;
  const lastActivityIso = openedAt
    ? new Date(openedAt).toISOString()
    : item.lastDownloadedAt;

  return (
    <article className="surface-panel group flex h-full flex-col overflow-hidden border-border/70 bg-background/70 transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.5)]">
      <Link
        href={
          item.filePath
            ? `/api/library/${item.productId}/read`
            : `/produkty/${item.slug}`
        }
        target={item.filePath ? "_blank" : undefined}
        rel={item.filePath ? "noopener noreferrer" : undefined}
        className={`relative isolate aspect-[16/10] overflow-hidden bg-gradient-to-br ${item.coverGradient}`}
      >
        {item.coverImageUrl && coverOverlayOpacity > 0 ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              backgroundImage: `url(${item.coverImageUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              opacity: coverOverlayOpacity,
            }}
          />
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-stone-950/40 via-stone-950/10 to-transparent"
        />
        <div className="relative flex h-full flex-col justify-between p-4">
          <div className="flex items-center justify-between gap-2">
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
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.24em] text-stone-900/85 [text-shadow:0_1px_0_rgba(255,255,255,0.4)]">
              {item.format}
            </p>
            <p className="line-clamp-2 break-words font-heading text-xl font-semibold text-stone-950 [text-shadow:0_1px_0_rgba(255,255,255,0.5)]">
              {item.name}
            </p>
          </div>
        </div>
        {hasProgress ? (
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1 bg-stone-950/25"
          >
            <div
              className="h-full bg-primary"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {isFinished ? (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            >
              Przeczytane
            </Badge>
          ) : hasProgress ? (
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary"
            >
              {progressValue}% przeczytane
            </Badge>
          ) : hasOpened ? (
            <Badge
              variant="outline"
              className="border-border/70 bg-background/60 text-muted-foreground"
            >
              Otwierane
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/10 text-primary"
            >
              Nowe
            </Badge>
          )}
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            zakup {formatAdminDate(item.createdAt)}
          </span>
        </div>

        <p className="line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
          {item.shortDescription}
        </p>

        {lastActivityIso ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {formatAdminDate(lastActivityIso)}
          </p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
          {item.filePath ? (
            <>
              <Button
                size="default"
                className="w-full sm:flex-1"
                render={
                  <a
                    href={`/api/library/${item.productId}/read`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <BookOpen className="size-4" />
                {hasProgress ? "Wróć do czytania" : "Czytaj"}
              </Button>
              <Button
                size="default"
                variant="outline"
                className="w-full sm:w-auto"
                render={
                  <Link href={`/api/library/${item.productId}/download`} />
                }
                aria-label="Pobierz plik"
              >
                <Download className="size-4" />
                <span className="sm:sr-only">Pobierz</span>
              </Button>
            </>
          ) : (
            <span className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/70 bg-background/60 px-5 py-3 text-sm font-semibold text-muted-foreground">
              <Sparkles className="size-4" />
              Plik wkrótce
            </span>
          )}
          <Button
            variant="ghost"
            size="default"
            className="w-full sm:w-auto"
            render={<Link href={`/produkty/${item.slug}`} />}
            aria-label="Karta produktu"
          >
            <ArrowUpRight className="size-4" />
            <span className="sm:sr-only">Karta produktu</span>
          </Button>
        </div>
      </div>
    </article>
  );
}

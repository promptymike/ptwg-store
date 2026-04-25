"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAdminDate } from "@/lib/format";
import { getCoverImageOverlayOpacity } from "@/lib/product";
import type { LibraryItemSnapshot } from "@/lib/supabase/store";

type ContinueReadingHeroProps = {
  items: LibraryItemSnapshot[];
};

const PROGRESS_KEY_PREFIX = "templify:reading-progress:";
const OPENED_KEY_PREFIX = "templify:reading-opened:";

type Snapshot = {
  progress: Record<string, number>;
  opened: Record<string, number>;
};

function readSnapshot(productIds: string[]): Snapshot {
  if (typeof window === "undefined") return { progress: {}, opened: {} };
  const progress: Record<string, number> = {};
  const opened: Record<string, number> = {};
  for (const id of productIds) {
    const p = window.localStorage.getItem(`${PROGRESS_KEY_PREFIX}${id}`);
    if (p) {
      const v = Number.parseFloat(p);
      if (Number.isFinite(v) && v > 0) {
        progress[id] = Math.min(100, Math.max(0, Math.round(v)));
      }
    }
    const o = window.localStorage.getItem(`${OPENED_KEY_PREFIX}${id}`);
    if (o) {
      const v = Number.parseInt(o, 10);
      if (Number.isFinite(v) && v > 0) opened[id] = v;
    }
  }
  return { progress, opened };
}

export function ContinueReadingHero({ items }: ContinueReadingHeroProps) {
  const productIds = useMemo(
    () => items.map((item) => item.productId),
    [items],
  );
  const [snapshot, setSnapshot] = useState<Snapshot>({
    progress: {},
    opened: {},
  });

  useEffect(() => {
    function refresh() {
      setSnapshot(readSnapshot(productIds));
    }
    refresh();
    function onStorage(event: StorageEvent) {
      if (
        !event.key ||
        (!event.key.startsWith(PROGRESS_KEY_PREFIX) &&
          !event.key.startsWith(OPENED_KEY_PREFIX))
      ) {
        return;
      }
      refresh();
    }
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [productIds]);

  const candidate = useMemo(() => {
    const inProgress = items
      .filter((item) => {
        if (!item.filePath) return false;
        const p = snapshot.progress[item.productId] ?? 0;
        return p > 0 && p < 95;
      })
      .sort((a, b) => {
        const ao = snapshot.opened[a.productId] ?? 0;
        const bo = snapshot.opened[b.productId] ?? 0;
        return bo - ao;
      });
    return inProgress[0] ?? null;
  }, [items, snapshot]);

  if (!candidate) return null;

  const progressValue = snapshot.progress[candidate.productId] ?? 0;
  const lastOpened = snapshot.opened[candidate.productId];
  const coverOverlayOpacity = getCoverImageOverlayOpacity(candidate);

  return (
    <article className="surface-panel group relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-background/70 to-background/70">
      <div className="grid gap-0 sm:grid-cols-[200px_minmax(0,1fr)]">
        <Link
          href={`/api/library/${candidate.productId}/read`}
          target="_blank"
          rel="noopener noreferrer"
          className={`relative isolate hidden min-h-[180px] overflow-hidden bg-gradient-to-br ${candidate.coverGradient} sm:block`}
          aria-label={`Wróć do czytania: ${candidate.name}`}
        >
          {candidate.coverImageUrl && coverOverlayOpacity > 0 ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: `url(${candidate.coverImageUrl})`,
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
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1.5 bg-stone-950/20"
          >
            <div
              className="h-full bg-primary"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </Link>

        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary"
            >
              W trakcie czytania
            </Badge>
            {lastOpened ? (
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <Clock className="size-3" />
                {formatAdminDate(new Date(lastOpened).toISOString())}
              </span>
            ) : null}
          </div>
          <div className="space-y-2">
            <Link
              href={`/produkty/${candidate.slug}`}
              className="block text-2xl text-foreground transition hover:text-primary"
            >
              {candidate.name}
            </Link>
            <p className="line-clamp-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {candidate.shortDescription}
            </p>
          </div>
          <div className="flex items-center gap-3">
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
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              render={
                <a
                  href={`/api/library/${candidate.productId}/read`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <BookOpen className="size-4" />
              Wróć do czytania
            </Button>
            <Button variant="outline" render={<Link href="/biblioteka" />}>
              Cała biblioteka
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

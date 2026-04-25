import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CircleDollarSign,
  Files,
  Mail,
  NotebookText,
  Package,
  Receipt,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

import { AdminTrends } from "@/components/admin/admin-trends";
import { formatAdminDate } from "@/lib/format";
import {
  getAdminDashboardSnapshot,
  getAdminRecentActivity,
  getAdminTrendsSnapshot,
} from "@/lib/supabase/store";

type ActivityIconProps = { className?: string };

const ACTIVITY_ICONS: Record<string, ComponentType<ActivityIconProps>> = {
  order: Receipt,
  review: Star,
  subscriber: Mail,
  blog: NotebookText,
};

export default async function AdminDashboardPage() {
  const [snapshot, activity, trends] = await Promise.all([
    getAdminDashboardSnapshot(),
    getAdminRecentActivity(12),
    getAdminTrendsSnapshot(30),
  ]);

  const heroCards = [
    {
      label: "Przychód",
      value: snapshot.revenue,
      detail: `${snapshot.orderCount} ${snapshot.orderCount === 1 ? "zamówienie" : "zamówień"}`,
      Icon: CircleDollarSign,
      href: "/admin/zamowienia",
      tone: "primary" as const,
    },
    {
      label: "Subskrybenci",
      value: String(snapshot.subscriberCount),
      detail: "newsletter (aktywni)",
      Icon: Users,
      href: "/admin/ustawienia",
      tone: "default" as const,
    },
    {
      label: "Recenzje do moderacji",
      value: String(snapshot.pendingReviewCount),
      detail: `${snapshot.approvedReviewCount} opublikowanych`,
      Icon: Star,
      href: "/admin/recenzje",
      tone:
        snapshot.pendingReviewCount > 0 ? ("warning" as const) : ("default" as const),
    },
    {
      label: "Niepodpięte pliki",
      value: String(snapshot.unattachedSourceCount),
      detail: "czekają w imporcie",
      Icon: Files,
      href: "/admin/import",
      tone:
        snapshot.unattachedSourceCount > 0
          ? ("warning" as const)
          : ("default" as const),
    },
  ];

  const catalogCards = [
    {
      label: "Produkty",
      value: String(snapshot.publishedCount),
      detail: `${snapshot.draftCount} draftów · ${snapshot.readyToPublishCount} ready`,
      Icon: Package,
      href: "/admin/produkty",
    },
    {
      label: "Pakiety",
      value: String(snapshot.bundleCount),
      detail: "aktywne bundle",
      Icon: Sparkles,
      href: "/admin/pakiety",
    },
    {
      label: "Wpisy bloga",
      value: String(snapshot.blogPublishedCount),
      detail: "opublikowane",
      Icon: BookOpen,
      href: "/admin/blog",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {heroCards.map((card) => {
          const Icon = card.Icon;
          const toneClasses =
            card.tone === "primary"
              ? "border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
              : card.tone === "warning"
                ? "border-amber-500/40 bg-amber-500/8"
                : "border-border/70";
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`surface-panel group flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 ${toneClasses}`}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-background/70 text-primary">
                  <Icon className="size-4" />
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                  {card.label}
                </p>
                <p className="text-3xl font-semibold text-foreground tabular-nums">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">{card.detail}</p>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {catalogCards.map((card) => {
          const Icon = card.Icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="surface-panel group flex items-center justify-between p-5 transition hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary/75">
                  {card.label}
                </p>
                <p className="text-2xl text-foreground tabular-nums">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground">{card.detail}</p>
              </div>
              <span className="inline-flex size-10 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition group-hover:border-primary/40 group-hover:text-primary">
                <Icon className="size-4" />
              </span>
            </Link>
          );
        })}
      </section>

      <AdminTrends daily={trends.daily} topProducts={trends.topProducts} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-panel space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-foreground">Ostatnie zdarzenia</h2>
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              ostatnie {activity.length}
            </span>
          </div>
          {activity.length === 0 ? (
            <p className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
              Tu pojawi się zamówienie / opinia / zapis na newsletter / nowy wpis
              z chwilą gdy ktoś coś zrobi w sklepie.
            </p>
          ) : (
            <ul className="space-y-2">
              {activity.map((event) => {
                const Icon =
                  ACTIVITY_ICONS[event.type] ?? Sparkles;
                return (
                  <li key={event.id}>
                    <Link
                      href={event.href}
                      className="group flex items-start gap-3 rounded-2xl border border-border/70 bg-background/60 px-4 py-3 transition hover:border-primary/30"
                    >
                      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-semibold text-foreground">
                          {event.title}
                        </p>
                        <p className="break-words text-xs text-muted-foreground [overflow-wrap:anywhere]">
                          {event.detail}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {formatAdminDate(event.createdAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <div className="surface-panel space-y-3 p-6">
            <h2 className="text-xl text-foreground">Szybkie akcje</h2>
            <div className="grid gap-2">
              <Link
                href="/admin/produkty"
                className="rounded-[1.2rem] border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-foreground transition hover:border-primary/30"
              >
                Dodaj nowy produkt
              </Link>
              <Link
                href="/admin/pakiety/nowy"
                className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-muted-foreground transition hover:text-foreground"
              >
                Stwórz pakiet
              </Link>
              <Link
                href="/admin/blog/nowy"
                className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-muted-foreground transition hover:text-foreground"
              >
                Napisz wpis na blogu
              </Link>
              {snapshot.pendingReviewCount > 0 ? (
                <Link
                  href="/admin/recenzje?status=pending"
                  className="rounded-[1.2rem] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground transition hover:border-amber-500/50"
                >
                  Zmoderuj {snapshot.pendingReviewCount}{" "}
                  {snapshot.pendingReviewCount === 1 ? "opinię" : "opinii"}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="surface-panel space-y-3 p-6">
            <h2 className="text-xl text-foreground">Stan operacyjny</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                {snapshot.adminCount} {snapshot.adminCount === 1 ? "admin" : "adminów"} z dostępem do panelu
              </li>
              <li>
                {snapshot.contentCount} {snapshot.contentCount === 1 ? "strona" : "stron"} treści (regulamin, polityki)
              </li>
              <li>
                Pliki, RLS i Stripe webhook chronią mutacje od strony klienta.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

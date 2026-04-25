import Link from "next/link";
import { Check, ShieldCheck, Star, X } from "lucide-react";

import { moderateReviewAction } from "@/app/actions/reviews";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { formatAdminDate } from "@/lib/format";
import { getAdminReviewsSnapshot } from "@/lib/supabase/reviews";

type AdminReviewsPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const FILTERS = [
  { value: "pending", label: "Do moderacji" },
  { value: "approved", label: "Opublikowane" },
  { value: "rejected", label: "Odrzucone" },
  { value: "all", label: "Wszystkie" },
] as const;

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const { status: rawStatus } = await searchParams;
  const status = (FILTERS.find((f) => f.value === rawStatus)?.value ?? "pending");
  const reviews = await getAdminReviewsSnapshot(status);

  return (
    <div className="space-y-6">
      <div className="surface-panel space-y-3 p-6">
        <div className="space-y-1">
          <h2 className="text-2xl text-foreground">Moderacja opinii</h2>
          <p className="text-sm text-muted-foreground">
            Po zatwierdzeniu opinia od razu pojawia się na karcie produktu i
            zaczyna wpływać na średnią ocenę widoczną w Google (rich snippet).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = filter.value === status;
            return (
              <Link
                key={filter.value}
                href={`/admin/recenzje?status=${filter.value}`}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isActive
                    ? "border-primary/40 bg-primary text-primary-foreground"
                    : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          badge="Recenzje"
          title="Brak opinii w tej kategorii"
          description={
            status === "pending"
              ? "Świetnie — nic nie czeka na moderację. Pierwsza opinia od kupującego pojawi się tu automatycznie."
              : "Tu pojawią się opinie spełniające wybrany filtr."
          }
        />
      ) : (
        <div className="grid gap-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="surface-panel space-y-4 p-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`size-4 ${
                            idx < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      review.status === "approved"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : review.status === "rejected"
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}>
                      {review.status === "approved"
                        ? "Opublikowane"
                        : review.status === "rejected"
                          ? "Odrzucone"
                          : "Czeka"}
                    </span>
                    {review.isVerifiedPurchase ? (
                      <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
                        <ShieldCheck className="size-3.5" />
                        Zweryfikowany zakup
                      </span>
                    ) : null}
                  </div>
                  {review.title ? (
                    <h3 className="break-words text-lg font-semibold text-foreground">
                      {review.title}
                    </h3>
                  ) : null}
                  <p className="text-xs text-muted-foreground">
                    {review.authorName} ({review.authorEmail}) · produkt:{" "}
                    <Link
                      href={`/produkty/${review.productSlug}`}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {review.productName}
                    </Link>{" "}
                    · {formatAdminDate(review.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  {review.status !== "approved" ? (
                    <form action={moderateReviewAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="nextStatus" value="approved" />
                      <Button type="submit" size="sm">
                        <Check className="size-3.5" />
                        Zatwierdź
                      </Button>
                    </form>
                  ) : null}
                  {review.status !== "rejected" ? (
                    <form action={moderateReviewAction}>
                      <input type="hidden" name="reviewId" value={review.id} />
                      <input type="hidden" name="nextStatus" value="rejected" />
                      <Button type="submit" size="sm" variant="outline">
                        <X className="size-3.5" />
                        Odrzuć
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>

              <p className="break-words text-sm leading-7 text-foreground">
                {review.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

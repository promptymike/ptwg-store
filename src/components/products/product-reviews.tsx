"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2, Quote, ShieldCheck, Star } from "lucide-react";

import {
  type SubmitReviewState,
  submitReviewAction,
} from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatAdminDate } from "@/lib/format";
import type { ProductReview, ReviewSummary } from "@/lib/supabase/reviews";

type ProductReviewsProps = {
  productId: string;
  productName: string;
  reviews: ProductReview[];
  summary: ReviewSummary;
  /** True when the buyer has the product in their library. */
  canReview: boolean;
  existingReview?: {
    rating: number;
    title: string;
    body: string;
    status: "pending" | "approved" | "rejected";
  } | null;
};

export function ProductReviews({
  productId,
  productName,
  reviews,
  summary,
  canReview,
  existingReview,
}: ProductReviewsProps) {
  if (reviews.length === 0 && !canReview) {
    return null;
  }

  return (
    <section id="recenzje" className="space-y-6 scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
            Opinie czytelniczek i czytelników
          </p>
          <h2 className="text-3xl text-foreground sm:text-4xl">
            {summary.count > 0
              ? `${summary.count} ${summary.count === 1 ? "opinia" : "opinii"} po zakupie`
              : "Bądź pierwsza/y, kto zostawi opinię"}
          </h2>
        </div>

        {summary.count > 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 px-5 py-3">
            <StarRow rating={summary.average} size={18} />
            <div className="text-sm">
              <span className="font-semibold text-foreground tabular-nums">
                {summary.average.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                {" "}/ 5 · {summary.count} {summary.count === 1 ? "opinia" : "opinii"}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {summary.count > 0 ? (
        <div className="surface-panel space-y-2 p-5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.histogram[star] ?? 0;
            const percent = summary.count > 0 ? (count / summary.count) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="inline-flex w-10 items-center gap-1 text-muted-foreground tabular-nums">
                  {star}
                  <Star className="size-3 fill-primary text-primary" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-border/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {reviews.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="surface-panel relative flex h-full flex-col gap-4 p-6"
            >
              <Quote
                className="absolute right-5 top-5 size-8 text-primary/20"
                aria-hidden
              />
              <StarRow rating={review.rating} />
              {review.title ? (
                <h3 className="text-base font-semibold text-foreground">
                  {review.title}
                </h3>
              ) : null}
              <p className="flex-1 text-sm leading-7 text-foreground">
                &bdquo;{review.body}&rdquo;
              </p>
              <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs">
                <span className="font-semibold text-foreground">
                  {review.authorName}
                </span>
                {review.isVerifiedPurchase ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="size-3.5" />
                    Zweryfikowany zakup
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {formatAdminDate(review.createdAt)}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      {canReview ? (
        <ReviewForm
          productId={productId}
          productName={productName}
          existingReview={existingReview ?? null}
        />
      ) : null}
    </section>
  );
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} z 5 gwiazdek`}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star
          key={idx}
          style={{ width: size, height: size }}
          className={
            idx < rounded ? "fill-primary text-primary" : "text-muted-foreground/40"
          }
        />
      ))}
    </div>
  );
}

function ReviewForm({
  productId,
  productName,
  existingReview,
}: {
  productId: string;
  productName: string;
  existingReview: ProductReviewsProps["existingReview"];
}) {
  const [state, formAction, isPending] = useActionState<SubmitReviewState, FormData>(
    submitReviewAction,
    { status: "idle" },
  );
  const [rating, setRating] = useState<number>(existingReview?.rating ?? 5);

  const isPendingReview = existingReview?.status === "pending";
  const isApproved = existingReview?.status === "approved";

  return (
    <div className="surface-panel space-y-4 p-6 sm:p-8">
      <div className="space-y-1">
        <p className="eyebrow">Twoja opinia o {productName}</p>
        <h3 className="text-2xl text-foreground">
          {existingReview
            ? isApproved
              ? "Twoja opinia jest opublikowana"
              : "Twoja opinia czeka na moderację"
            : "Podziel się swoim doświadczeniem"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {existingReview
            ? isApproved
              ? "Możesz ją zedytować poniżej — po zapisie wróci do moderacji."
              : "Sprawdzimy ją w 24h. Jeśli wszystko OK, pojawi się na karcie produktu."
            : "Krótka opinia po zakupie pomaga innym zdecydować. Trafia do moderacji, opublikujemy ją w ciągu 24h."}
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="rating" value={rating} />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Ocena:</span>
          {Array.from({ length: 5 }).map((_, idx) => {
            const star = idx + 1;
            const active = star <= rating;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                aria-label={`Oceń na ${star} gwiazdek`}
                className="rounded-full p-1 transition hover:scale-110"
              >
                <Star
                  className={`size-6 transition ${
                    active ? "fill-primary text-primary" : "text-muted-foreground/40"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Tytuł (opcjonalny)</span>
          <Input
            name="title"
            maxLength={120}
            placeholder="np. Krótko: warto"
            defaultValue={existingReview?.title ?? ""}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Twoja opinia</span>
          <Textarea
            name="body"
            required
            minLength={20}
            maxLength={800}
            rows={5}
            placeholder="Co konkretnie Ci się przydało? Jak długo czytałaś/eś? Komu polecasz?"
            defaultValue={existingReview?.body ?? ""}
          />
          <p className="text-[11px] text-muted-foreground">
            Min. 20 znaków, max. 800. Bez danych osobowych innych osób.
          </p>
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Wysyłanie…
              </>
            ) : isPendingReview ? (
              "Zaktualizuj opinię"
            ) : (
              "Wyślij do moderacji"
            )}
          </Button>
          {state.status === "ok" ? (
            <span className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              {state.message}
            </span>
          ) : null}
          {state.status === "error" ? (
            <span className="text-sm text-destructive" role="alert">
              {state.message}
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}

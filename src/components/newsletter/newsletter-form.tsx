"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

import {
  type SubscribeNewsletterState,
  subscribeToNewsletterAction,
} from "@/app/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NewsletterFormProps = {
  /** Where the form lives, for analytics + segmenting in Resend later. */
  source?: string;
  /** Compact = single-row inline form for footer; full = stacked card for hero. */
  variant?: "compact" | "full";
};

export function NewsletterForm({
  source = "inline",
  variant = "full",
}: NewsletterFormProps) {
  const [state, formAction, isPending] = useActionState<
    SubscribeNewsletterState,
    FormData
  >(subscribeToNewsletterAction, { status: "idle" });

  const isCompact = variant === "compact";

  return (
    <form
      action={formAction}
      className={
        isCompact
          ? "flex flex-col gap-2 sm:flex-row sm:items-start"
          : "space-y-3"
      }
    >
      <input type="hidden" name="source" value={source} />
      {/* honeypot — hidden, bots fill it, humans don't */}
      <label
        aria-hidden="true"
        className="absolute -z-10 size-0 overflow-hidden opacity-0"
      >
        Strona <input type="text" name="hp" tabIndex={-1} autoComplete="off" />
      </label>

      <div className={isCompact ? "flex-1" : "space-y-2"}>
        <Input
          type="email"
          name="email"
          required
          placeholder="twoj@email.pl"
          aria-label="Adres e-mail"
          autoComplete="email"
        />
        {!isCompact ? (
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              name="consent"
              defaultChecked
              required
              className="mt-1 size-4 shrink-0 accent-[var(--color-foreground)]"
            />
            Zgadzam się na otrzymywanie newslettera od Templify (RODO). Możesz
            wypisać się w każdej chwili.
          </label>
        ) : (
          <input type="hidden" name="consent" value="true" />
        )}
      </div>

      <Button type="submit" disabled={isPending} className={isCompact ? "" : "w-full sm:w-auto"}>
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Zapisywanie…
          </>
        ) : (
          <>
            <Mail className="size-4" />
            Zapisz mnie
          </>
        )}
      </Button>

      {state.status === "ok" ? (
        <p
          role="status"
          className="inline-flex w-full items-center gap-2 text-sm text-emerald-700 sm:basis-full dark:text-emerald-400"
        >
          <CheckCircle2 className="size-4" />
          {state.message}
        </p>
      ) : null}
      {state.status === "error" ? (
        <p
          role="alert"
          className="text-sm text-destructive sm:basis-full"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

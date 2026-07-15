"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import {
  type SupportRequestState,
  submitSupportRequestAction,
} from "@/app/actions/support";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SUPPORT_TOPICS } from "@/lib/email/support-templates";

type SupportFormProps = {
  defaultEmail?: string;
  defaultTopic?: string;
};

export function SupportForm({ defaultEmail, defaultTopic }: SupportFormProps) {
  const [state, formAction, isPending] = useActionState<
    SupportRequestState,
    FormData
  >(submitSupportRequestAction, { status: "idle" });

  if (state.status === "ok") {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-700/25 bg-emerald-50/80 p-6 text-emerald-950"
      >
        <CheckCircle2 className="size-6 text-emerald-700" />
        {state.ticketNumber ? (
          <p className="text-sm font-semibold">
            Numer Twojego zgłoszenia:{" "}
            <span className="rounded-full border border-emerald-700/30 bg-white/70 px-3 py-1 font-mono text-sm">
              {state.ticketNumber}
            </span>
          </p>
        ) : null}
        <p className="text-sm leading-7">{state.message}</p>
        <p className="text-xs text-emerald-900/70">
          Kopię zgłoszenia z numerem i linkiem do śledzenia statusu wysłaliśmy
          na Twój adres e-mail.
        </p>
        {state.trackingUrl ? (
          <a
            href={state.trackingUrl}
            className="text-sm font-semibold text-emerald-800 underline underline-offset-2 hover:text-emerald-700"
          >
            Sprawdź status zgłoszenia →
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* honeypot — hidden, bots fill it, humans don't */}
      <label
        aria-hidden="true"
        className="absolute -z-10 size-0 overflow-hidden opacity-0"
      >
        Strona <input type="text" name="hp" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="support-name" className="text-sm font-medium text-foreground">
            Imię
          </label>
          <Input
            id="support-name"
            name="name"
            required
            minLength={2}
            placeholder="Twoje imię"
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="support-email" className="text-sm font-medium text-foreground">
            E-mail
          </label>
          <Input
            id="support-email"
            type="email"
            name="email"
            required
            defaultValue={defaultEmail}
            placeholder="twoj@email.pl"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="support-topic" className="text-sm font-medium text-foreground">
            Temat zgłoszenia
          </label>
          <select
            id="support-topic"
            name="topic"
            defaultValue={defaultTopic ?? "pytanie"}
            className="h-10 w-full rounded-xl border border-border/80 bg-background/70 px-3 text-sm text-foreground outline-none transition focus-visible:border-primary/50"
          >
            {SUPPORT_TOPICS.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="support-order" className="text-sm font-medium text-foreground">
            Numer zamówienia <span className="text-muted-foreground">(opcjonalnie)</span>
          </label>
          <Input
            id="support-order"
            name="orderRef"
            placeholder="np. TMP-1024"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="support-message" className="text-sm font-medium text-foreground">
          Wiadomość
        </label>
        <Textarea
          id="support-message"
          name="message"
          required
          minLength={10}
          rows={6}
          placeholder="Opisz swoją sprawę — im więcej szczegółów, tym szybciej pomożemy."
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted-foreground">
          Wysyłając formularz, zgadzasz się na kontakt w sprawie zgłoszenia
          (szczegóły w polityce prywatności).
        </p>
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Wysyłanie…
            </>
          ) : (
            <>
              <Send className="size-4" />
              Wyślij zgłoszenie
            </>
          )}
        </Button>
      </div>

      {state.status === "error" ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

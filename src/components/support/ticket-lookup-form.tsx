"use client";

import { useActionState } from "react";
import { Loader2, SearchCheck } from "lucide-react";

import {
  lookupSupportRequestAction,
  type SupportLookupState,
} from "@/app/actions/support";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Guest-facing "where is my ticket" form: number + e-mail → redirect to the
// token-scoped status page (no personal data ends up in the URL).
export function TicketLookupForm() {
  const [state, formAction, isPending] = useActionState<
    SupportLookupState,
    FormData
  >(lookupSupportRequestAction, { status: "idle" });

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="lookup-ticket"
            className="text-sm font-medium text-foreground"
          >
            Numer zgłoszenia
          </label>
          <Input
            id="lookup-ticket"
            name="ticketNumber"
            required
            placeholder="np. TPL-00123"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="lookup-email"
            className="text-sm font-medium text-foreground"
          >
            E-mail podany w zgłoszeniu
          </label>
          <Input
            id="lookup-email"
            type="email"
            name="email"
            required
            placeholder="twoj@email.pl"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted-foreground">
          Numer zgłoszenia znajdziesz w mailu potwierdzającym.
        </p>
        <Button type="submit" variant="outline" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Szukanie…
            </>
          ) : (
            <>
              <SearchCheck className="size-4" />
              Sprawdź status
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

"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Megaphone } from "lucide-react";

import {
  type BroadcastState,
  broadcastPushAction,
} from "@/app/actions/push-broadcast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AdminPushBroadcast() {
  const [state, formAction, isPending] = useActionState<
    BroadcastState,
    FormData
  >(broadcastPushAction, { status: "idle" });

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Tytuł
          </span>
          <Input
            name="title"
            required
            maxLength={80}
            placeholder="np. Nowy ebook czeka na Ciebie"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Link (opcjonalnie)
          </span>
          <Input
            name="url"
            maxLength={500}
            placeholder="/produkty/nowy-ebook"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Treść
        </span>
        <Textarea
          name="body"
          required
          rows={3}
          maxLength={240}
          placeholder="Krótko, do 240 znaków. Trafia na lockscreen telefonu."
        />
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Wysyłam…
            </>
          ) : (
            <>
              <Megaphone className="size-4" />
              Wyślij broadcast
            </>
          )}
        </Button>
        {state.status === "ok" ? (
          <p
            role="status"
            className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-4" />
            {state.message}
          </p>
        ) : null}
        {state.status === "error" ? (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

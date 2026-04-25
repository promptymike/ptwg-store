"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Status =
  | "loading"
  | "unsupported"
  | "denied"
  | "subscribed"
  | "not_subscribed"
  | "no_vapid";

type PushNotificationsCardProps = {
  vapidPublicKey?: string;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

export function PushNotificationsCard({
  vapidPublicKey,
}: PushNotificationsCardProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!vapidPublicKey) {
        if (!cancelled) setStatus("no_vapid");
        return;
      }
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (!cancelled) setStatus(sub ? "subscribed" : "not_subscribed");
      } catch {
        if (!cancelled) setStatus("not_subscribed");
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [vapidPublicKey]);

  async function subscribe() {
    if (!vapidPublicKey) return;
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "not_subscribed");
        setMessage("Powiadomienia muszą być włączone w przeglądarce.");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!response.ok) {
        // Roll back the browser-side subscription so the UI stays honest.
        await sub.unsubscribe().catch(() => null);
        const data = await response.json().catch(() => null);
        setMessage(data?.message ?? "Nie udało się włączyć powiadomień.");
        setStatus("not_subscribed");
        return;
      }
      setStatus("subscribed");
      setMessage("Powiadomienia włączone — przypomnimy o nowościach.");
    } catch {
      setMessage("Coś poszło nie tak. Spróbuj jeszcze raz.");
      setStatus("not_subscribed");
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribe() {
    setBusy(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => null);
        await sub.unsubscribe();
      }
      setStatus("not_subscribed");
      setMessage("Wyłączono. Możesz włączyć ponownie kiedy chcesz.");
    } catch {
      setMessage("Nie udało się wyłączyć. Spróbuj jeszcze raz.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "no_vapid" || status === "unsupported") {
    return null;
  }

  return (
    <section className="surface-panel space-y-4 p-6">
      <div className="flex items-start gap-4">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          {status === "subscribed" ? (
            <Bell className="size-4" />
          ) : (
            <BellOff className="size-4" />
          )}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Powiadomienia push
          </h2>
          <p className="text-sm text-muted-foreground">
            Damy znać o nowych ebookach, akcjach i bonusie po seriach
            czytelniczych. Bez spamu — średnio 1-2 powiadomienia w miesiącu.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {status === "loading" ? (
          <Button size="sm" variant="outline" disabled>
            <Loader2 className="size-3.5 animate-spin" />
            Sprawdzam status…
          </Button>
        ) : status === "denied" ? (
          <p className="text-xs text-muted-foreground">
            Powiadomienia są zablokowane na poziomie przeglądarki. Włącz je w
            ustawieniach strony i wróć tu.
          </p>
        ) : status === "subscribed" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={unsubscribe}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <BellOff className="size-3.5" />
            )}
            Wyłącz powiadomienia
          </Button>
        ) : (
          <Button size="sm" onClick={subscribe} disabled={busy}>
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Bell className="size-3.5" />
            )}
            Włącz powiadomienia
          </Button>
        )}
        {message ? (
          <p className="text-xs text-muted-foreground">{message}</p>
        ) : null}
      </div>
    </section>
  );
}

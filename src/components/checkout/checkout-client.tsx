"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, FlaskConical, Lock, ShieldCheck, Tag, Zap } from "lucide-react";

import { useAnalytics } from "@/components/analytics/analytics-provider";
import { useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClientStripeStatus } from "@/lib/env";
import { formatCurrency } from "@/lib/format";
import { findPromoRule, type PromoRule } from "@/lib/promo";

type CheckoutResponse = {
  url?: string;
  message?: string;
  code?: string;
  missing?: string[];
};

type CheckoutHealth = {
  ready: boolean;
  testMode: boolean;
  liveMode: boolean;
  siteUrl: string | null;
  missing?: string[];
  webhookConfigured: boolean;
};

type CheckoutClientProps = {
  initialEmail: string;
};

export function CheckoutClient({ initialEmail }: CheckoutClientProps) {
  const { items, subtotal, isReady } = useCart();
  const { track } = useAnalytics();
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoRule, setPromoRule] = useState<PromoRule | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [health, setHealth] = useState<CheckoutHealth | null>(null);
  const trackedCheckoutRef = useRef(false);
  const clientStripeStatus = useMemo(() => getClientStripeStatus(), []);

  const discountAmount = promoRule ? Math.round(subtotal * (promoRule.percentOff / 100)) : 0;
  const totalAfterPromo = Math.max(subtotal - discountAmount, 0);

  function handleApplyPromo() {
    setPromoMessage(null);
    if (!promoInput.trim()) {
      setPromoRule(null);
      return;
    }
    const rule = findPromoRule(promoInput);
    if (rule) {
      setPromoRule(rule);
      setPromoMessage(`Zastosowano: ${rule.label}`);
    } else {
      setPromoRule(null);
      setPromoMessage("Ten kod nie działa lub wygasł.");
    }
  }

  function handleRemovePromo() {
    setPromoRule(null);
    setPromoInput("");
    setPromoMessage(null);
  }

  const lines = useMemo(
    () =>
      items
        .map((item) =>
          item.product ? { ...item.product, quantity: item.quantity } : null,
        )
        .filter(Boolean),
    [items],
  );

  useEffect(() => {
    if (!isReady || lines.length === 0 || trackedCheckoutRef.current) {
      return;
    }

    track("begin_checkout", {
      itemCount: lines.length,
      subtotal,
      items: lines.map((line) =>
        line
          ? {
              productId: line.id,
              slug: line.slug,
              name: line.name,
              quantity: line.quantity,
              price: line.price,
            }
          : null,
      ),
    });

    trackedCheckoutRef.current = true;
  }, [isReady, lines, subtotal, track]);

  useEffect(() => {
    let cancelled = false;

    async function fetchHealth() {
      try {
        const response = await fetch("/api/checkout/health", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as CheckoutHealth;
        if (!cancelled) {
          setHealth(data);
        }
      } catch {
        // Silent — the server route remains the source of truth for blocking.
      }
    }

    fetchHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCheckout() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          promoCode: promoRule?.code,
        }),
      });

      const data = (await response.json()) as CheckoutResponse;

      if (!response.ok || !data.url) {
        if (data.code === "stripe_env_missing" && data.missing && data.missing.length > 0) {
          // Dev/admin response — surface the missing vars so QA can fix .env.
          throw new Error(
            `Stripe nie jest skonfigurowany: brakuje ${data.missing.join(", ")}.`,
          );
        }

        throw new Error(
          data.message ?? "Nie udało się rozpocząć płatności. Spróbuj ponownie za chwilę.",
        );
      }

      window.location.assign(data.url);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Nie udało się rozpocząć płatności. Spróbuj ponownie za chwilę.",
      );
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return <div className="surface-panel h-80 animate-pulse bg-primary/5" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        badge="Płatność"
        title="Najpierw dodaj coś do koszyka"
        description="Żeby przejść do płatności, wybierz przynajmniej jeden ebook z katalogu. Zajmie Ci to chwilę."
        action={{ href: "/produkty", label: "Przeglądaj katalog" }}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="surface-panel space-y-6 p-6 sm:p-8">
        <div className="space-y-3">
          <span className="eyebrow">Bezpieczna płatność</span>
          <div>
            <h1 className="text-4xl text-foreground sm:text-5xl">Finalizacja zamówienia</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Jeszcze tylko jeden krok. Po kliknięciu poniżej przejdziesz do bezpiecznej strony
              płatności. Dostęp do plików otrzymasz natychmiast po zakupie.
            </p>
          </div>
          {clientStripeStatus.testMode || (health && !health.ready) ? (
            <CheckoutDevBanner health={health} testMode={clientStripeStatus.testMode} />
          ) : null}
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-foreground">Adres e-mail do zamówienia</span>
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="twoj@email.pl"
            type="email"
          />
          <span className="block text-xs text-muted-foreground">
            Na ten adres wyślemy potwierdzenie zakupu i szczegóły zamówienia.
          </span>
        </label>

        <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-5">
          <p className="text-sm font-medium text-foreground">Co dzieje się po kliknięciu?</p>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Przejdziesz do bezpiecznej strony płatności — karta, BLIK lub Apple Pay.</li>
            <li>2. Po zapłaceniu zobaczysz potwierdzenie i numer zamówienia.</li>
            <li>3. Pliki pojawią się w Twojej bibliotece w Templify natychmiast po płatności.</li>
          </ol>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleCheckout}
          disabled={isSubmitting || lines.length === 0}
        >
          {isSubmitting ? "Przekierowanie do płatności..." : "Przejdź do bezpiecznej płatności"}
        </Button>

        <ul className="grid gap-3 sm:grid-cols-3">
          <li className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lock className="mt-0.5 size-4 text-primary" />
            Szyfrowane połączenie SSL.
          </li>
          <li className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 text-primary" />
            14 dni na zwrot bez pytań.
          </li>
          <li className="flex items-start gap-2 text-xs text-muted-foreground">
            <Zap className="mt-0.5 size-4 text-primary" />
            Dostęp do plików natychmiast.
          </li>
        </ul>

        {errorMessage ? (
          <div className="rounded-[1.5rem] border border-destructive/30 bg-destructive/10 p-5 text-sm text-foreground">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <aside className="surface-panel h-fit space-y-4 p-6">
        <h2 className="text-2xl text-foreground">Podsumowanie</h2>
        <div className="space-y-3">
          {lines.map((line) =>
            line ? (
              <div
                key={line.id}
                className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-border/60 bg-background/70 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 break-words font-medium text-foreground">
                    {line.name}
                  </p>
                  <p className="text-muted-foreground">Ilość: {line.quantity}</p>
                </div>
                <span className="shrink-0 text-foreground">
                  {formatCurrency(line.price * line.quantity)}
                </span>
              </div>
            ) : null,
          )}
        </div>

        <div className="space-y-2 rounded-[1.2rem] border border-border/60 bg-background/70 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Tag className="size-4 text-primary" />
            Kod rabatowy
          </div>
          {promoRule ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-primary/10 px-3 py-2 text-sm">
              <span className="inline-flex items-center gap-2 font-semibold text-primary">
                <Check className="size-4" />
                {promoRule.code} · -{promoRule.percentOff}%
              </span>
              <button
                type="button"
                onClick={handleRemovePromo}
                className="text-xs text-muted-foreground transition hover:text-foreground"
              >
                Usuń
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={promoInput}
                onChange={(event) => setPromoInput(event.target.value)}
                placeholder="np. TEMPLIFY15"
                className="uppercase tracking-[0.16em]"
              />
              <Button type="button" variant="outline" onClick={handleApplyPromo}>
                Użyj
              </Button>
            </div>
          )}
          {promoMessage ? (
            <p className={`text-xs ${promoRule ? "text-primary" : "text-destructive"}`}>
              {promoMessage}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-border/60 pt-3 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Suma produktów</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {promoRule ? (
            <div className="flex items-center justify-between text-primary">
              <span>Rabat ({promoRule.code})</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between pt-1 text-base font-semibold text-foreground">
            <span>Do zapłaty</span>
            <span>{formatCurrency(totalAfterPromo)}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Cena zawiera podatek. Jeśli potrzebujesz danych do dokumentu zakupu, odpisz na maila z
          potwierdzeniem.
        </p>
        <Link href="/koszyk" className="inline-flex text-sm text-primary transition hover:text-primary/80">
          ← Wróć do koszyka
        </Link>
      </aside>
    </div>
  );
}

type CheckoutDevBannerProps = {
  health: CheckoutHealth | null;
  testMode: boolean;
};

function CheckoutDevBanner({ health, testMode }: CheckoutDevBannerProps) {
  const blocked = health ? !health.ready : false;
  const missing = health?.missing ?? [];

  if (blocked) {
    return (
      <div className="flex items-start gap-3 rounded-[1.3rem] border border-amber-400/40 bg-amber-500/10 p-4 text-xs text-amber-100">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden />
        <div className="space-y-1">
          <p className="font-semibold uppercase tracking-[0.18em] text-amber-200">
            Checkout zablokowany przez konfigurację
          </p>
          {missing.length > 0 ? (
            <p className="leading-5">
              Uzupełnij w <code className="rounded bg-black/20 px-1">.env.local</code>:{" "}
              {missing.map((key, index) => (
                <span key={key}>
                  <code className="rounded bg-black/20 px-1">{key}</code>
                  {index < missing.length - 1 ? ", " : ""}
                </span>
              ))}{" "}
              i zrestartuj serwer. Komunikat widzą tylko dev/admin.
            </p>
          ) : (
            <p className="leading-5">
              Serwer zgłasza brak konfiguracji Stripe. Sprawdź <code className="rounded bg-black/20 px-1">.env.local</code> i restart.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (testMode) {
    return (
      <div className="flex items-start gap-3 rounded-[1.3rem] border border-primary/25 bg-primary/10 p-4 text-xs text-muted-foreground">
        <FlaskConical className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <div className="space-y-1">
          <p className="font-semibold uppercase tracking-[0.18em] text-primary">
            Stripe test mode
          </p>
          <p className="leading-5">
            Użyj karty testowej <code className="rounded bg-black/20 px-1">4242 4242 4242 4242</code>, dowolnej
            przyszłej daty i <code className="rounded bg-black/20 px-1">CVC 123</code>. Po zakupie sprawdź{" "}
            <Link className="text-primary underline" href="/biblioteka">
              bibliotekę
            </Link>
            {health?.webhookConfigured === false
              ? " (webhook nieustawiony — success page sam zapisze order)"
              : ""}
            .
          </p>
        </div>
      </div>
    );
  }

  return null;
}

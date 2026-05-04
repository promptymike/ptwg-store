"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  FlaskConical,
  Gift,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";

import { useAnalytics } from "@/components/analytics/analytics-provider";
import { useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readAffiliateRef } from "@/lib/affiliate";
import { readAttribution } from "@/lib/attribution";
import { getClientStripeStatus } from "@/lib/env";
import { formatCurrency } from "@/lib/format";
import type { PromoRule } from "@/lib/promo";

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

type OrderBumpSnapshot = {
  product: {
    id: string;
    slug: string;
    name: string;
    category: string;
    shortDescription: string;
    price: number;
    coverGradient: string;
  };
  discountPercent: number;
  originalPrice: number;
  discountedPrice: number;
};

type CheckoutClientProps = {
  initialEmail: string;
  orderBump?: OrderBumpSnapshot | null;
};

type CouponValidationResponse = {
  ok?: boolean;
  code?: string;
  label?: string;
  percentOff?: number;
  discountAmount?: number;
  message?: string;
};

export function CheckoutClient({ initialEmail, orderBump }: CheckoutClientProps) {
  const { items, subtotal, isReady } = useCart();
  const { track } = useAnalytics();
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoRule, setPromoRule] = useState<PromoRule | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [promoBusy, setPromoBusy] = useState(false);
  const [orderBumpAccepted, setOrderBumpAccepted] = useState(false);
  const [giftInput, setGiftInput] = useState("");
  const [giftCode, setGiftCode] = useState<{
    code: string;
    amountMinor: number;
  } | null>(null);
  const [giftMessage, setGiftMessage] = useState<string | null>(null);
  const [giftBusy, setGiftBusy] = useState(false);
  const [health, setHealth] = useState<CheckoutHealth | null>(null);
  const trackedCheckoutRef = useRef(false);
  const clientStripeStatus = useMemo(() => getClientStripeStatus(), []);

  const orderBumpAlreadyInCart = Boolean(
    orderBump && items.some((item) => item.productId === orderBump.product.id),
  );
  const orderBumpAvailable = Boolean(orderBump && !orderBumpAlreadyInCart);
  const appliedOrderBump =
    orderBumpAvailable && orderBumpAccepted && orderBump ? orderBump : null;
  const orderBumpPrice = appliedOrderBump?.discountedPrice ?? 0;
  const orderBumpSavings = appliedOrderBump
    ? Math.max(appliedOrderBump.originalPrice - appliedOrderBump.discountedPrice, 0)
    : 0;
  const checkoutSubtotal = subtotal + orderBumpPrice;
  const discountAmount = promoRule
    ? Math.round(checkoutSubtotal * (promoRule.percentOff / 100))
    : 0;
  const totalAfterPromo = Math.max(checkoutSubtotal - discountAmount, 0);
  const giftAmountPln = giftCode ? Math.round(giftCode.amountMinor / 100) : 0;
  const giftApplied = Math.min(giftAmountPln, totalAfterPromo);
  const totalAfterGift = Math.max(totalAfterPromo - giftApplied, 0);

  async function handleApplyPromo() {
    setPromoMessage(null);
    if (!promoInput.trim()) {
      setPromoRule(null);
      return;
    }

    setPromoBusy(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, subtotal: checkoutSubtotal }),
      });
      const data = (await response.json().catch(() => null)) as
        | CouponValidationResponse
        | null;

      if (!response.ok || !data?.ok || !data.code || !data.percentOff) {
        setPromoRule(null);
        setPromoMessage(data?.message ?? "Ten kod nie dziala lub wygasl.");
        return;
      }

      setPromoRule({
        code: data.code,
        label: data.label ?? `Kod ${data.code}`,
        percentOff: data.percentOff,
      });
      setPromoMessage(`Zastosowano: ${data.label ?? data.code}`);
    } catch {
      setPromoRule(null);
      setPromoMessage("Nie udalo sie sprawdzic kodu. Sprobuj ponownie.");
    } finally {
      setPromoBusy(false);
    }
  }

  function handleRemovePromo() {
    setPromoRule(null);
    setPromoInput("");
    setPromoMessage(null);
  }

  async function handleApplyGift() {
    setGiftMessage(null);
    const code = giftInput.trim();
    if (!code) {
      setGiftCode(null);
      return;
    }
    setGiftBusy(true);
    try {
      const response = await fetch("/api/gift/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; code?: string; amountMinor?: number; message?: string }
        | null;
      if (!response.ok || !data?.ok || !data.code || !data.amountMinor) {
        setGiftCode(null);
        setGiftMessage(data?.message ?? "Voucher nie został rozpoznany.");
        return;
      }
      setGiftCode({ code: data.code, amountMinor: data.amountMinor });
      setGiftMessage(
        `Voucher na ${Math.round(data.amountMinor / 100)} zł zostanie zastosowany przy płatności.`,
      );
    } catch {
      setGiftCode(null);
      setGiftMessage("Nie udało się sprawdzić kodu. Spróbuj ponownie.");
    } finally {
      setGiftBusy(false);
    }
  }

  function handleRemoveGift() {
    setGiftCode(null);
    setGiftInput("");
    setGiftMessage(null);
  }

  function handleOrderBumpToggle(nextValue: boolean) {
    setOrderBumpAccepted(nextValue);

    if (nextValue && orderBump) {
      track("add_to_cart", {
        productId: orderBump.product.id,
        product_id: orderBump.product.id,
        slug: orderBump.product.slug,
        product_slug: orderBump.product.slug,
        name: orderBump.product.name,
        product_name: orderBump.product.name,
        category: orderBump.product.category,
        price: orderBump.discountedPrice,
        original_price: orderBump.originalPrice,
        discount_percent: orderBump.discountPercent,
        currency: "PLN",
        quantity: 1,
        surface: "checkout_order_bump",
      });
    }
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
      subtotal: checkoutSubtotal,
      order_total: totalAfterGift,
      currency: "PLN",
      order_bump_available: orderBumpAvailable,
      items: lines.map((line) =>
        line
          ? {
              productId: line.id,
              product_id: line.id,
              slug: line.slug,
              product_slug: line.slug,
              name: line.name,
              product_name: line.name,
              category: line.category,
              quantity: line.quantity,
              price: line.price,
            }
          : null,
      ),
    });

    trackedCheckoutRef.current = true;
  }, [
    checkoutSubtotal,
    isReady,
    lines,
    orderBumpAvailable,
    totalAfterGift,
    track,
  ]);

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
          orderBumpProductId: appliedOrderBump?.product.id,
          giftCode: giftCode?.code,
          affiliateRef: readAffiliateRef()?.code,
          attribution: readAttribution() ?? undefined,
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

        {orderBumpAvailable && orderBump ? (
          <div
            className={`rounded-[1.2rem] border p-4 transition ${
              orderBumpAccepted
                ? "border-primary/40 bg-primary/10"
                : "border-border/60 bg-background/70"
            }`}
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={orderBumpAccepted}
                onChange={(event) => handleOrderBumpToggle(event.target.checked)}
                className="mt-1 size-4 shrink-0 accent-[var(--color-foreground)]"
              />
              <span className="min-w-0 flex-1 space-y-2">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="size-4" />
                  Oferta przy checkout
                </span>
                <span className="block text-sm font-semibold text-foreground">
                  Dodaj {orderBump.product.name}
                </span>
                <span className="block text-xs leading-5 text-muted-foreground">
                  Jednorazowa cena w tym zamowieniu:{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(orderBump.discountedPrice)}
                  </span>{" "}
                  zamiast {formatCurrency(orderBump.originalPrice)}.
                </span>
              </span>
              <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                -{orderBump.discountPercent}%
              </span>
            </label>
          </div>
        ) : null}

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
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyPromo}
                disabled={promoBusy}
              >
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

        <div className="space-y-2 rounded-[1.2rem] border border-border/60 bg-background/70 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Gift className="size-4 text-primary" />
            Voucher podarunkowy
          </div>
          {giftCode ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-primary/10 px-3 py-2 text-sm">
              <span className="inline-flex items-center gap-2 font-semibold text-primary">
                <Check className="size-4" />
                {giftCode.code} · -{formatCurrency(giftAmountPln)}
              </span>
              <button
                type="button"
                onClick={handleRemoveGift}
                className="text-xs text-muted-foreground transition hover:text-foreground"
              >
                Usuń
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={giftInput}
                onChange={(event) => setGiftInput(event.target.value)}
                placeholder="GIFT-XXXX-XXXX-XXXX"
                className="uppercase tracking-[0.16em]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyGift}
                disabled={giftBusy}
              >
                {giftBusy ? <Loader2 className="size-4 animate-spin" /> : "Użyj"}
              </Button>
            </div>
          )}
          {giftMessage ? (
            <p className={`text-xs ${giftCode ? "text-primary" : "text-destructive"}`}>
              {giftMessage}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-border/60 pt-3 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Suma produktów</span>
            <span>{formatCurrency(checkoutSubtotal)}</span>
          </div>
          {appliedOrderBump ? (
            <div className="flex items-center justify-between text-primary">
              <span>Oferta checkout ({appliedOrderBump.discountPercent}%)</span>
              <span>
                {formatCurrency(appliedOrderBump.discountedPrice)}
                {orderBumpSavings > 0 ? `, oszczędzasz ${formatCurrency(orderBumpSavings)}` : ""}
              </span>
            </div>
          ) : null}
          {promoRule ? (
            <div className="flex items-center justify-between text-primary">
              <span>Rabat ({promoRule.code})</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          ) : null}
          {giftCode ? (
            <div className="flex items-center justify-between text-primary">
              <span>Voucher ({giftCode.code})</span>
              <span>-{formatCurrency(giftApplied)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between pt-1 text-base font-semibold text-foreground">
            <span>Do zapłaty</span>
            <span>{formatCurrency(totalAfterGift)}</span>
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

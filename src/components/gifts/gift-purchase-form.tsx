"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GIFT_CODE_DENOMINATIONS, GIFT_CODE_MAX, GIFT_CODE_MIN } from "@/lib/gift-constants";

type Mode = "self" | "recipient";

export function GiftPurchaseForm() {
  const [amount, setAmount] = useState<number>(GIFT_CODE_DENOMINATIONS[1]);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [mode, setMode] = useState<Mode>("self");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usingCustom = amount === 0;
  const effectiveAmount = usingCustom ? Number(customAmount) || 0 : amount;
  const submittable =
    effectiveAmount >= GIFT_CODE_MIN && effectiveAmount <= GIFT_CODE_MAX;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setBusy(true);
    try {
      const payload = {
        amountPln: effectiveAmount,
        purchaserEmail: String(formData.get("purchaserEmail") ?? "").trim(),
        recipientEmail:
          mode === "recipient"
            ? String(formData.get("recipientEmail") ?? "").trim()
            : null,
        recipientName:
          mode === "recipient"
            ? String(formData.get("recipientName") ?? "").trim() || null
            : null,
        message:
          mode === "recipient"
            ? String(formData.get("message") ?? "").trim() || null
            : null,
      };
      const response = await fetch("/api/gift/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as
        | { url?: string; message?: string }
        | null;
      if (!response.ok || !data?.url) {
        setError(data?.message ?? "Nie udało się rozpocząć płatności.");
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Wystąpił błąd sieci. Spróbuj ponownie.");
      setBusy(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Wartość vouchera
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GIFT_CODE_DENOMINATIONS.map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => {
                setAmount(value);
                setCustomAmount("");
              }}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                amount === value
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {value} zł
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/60 p-3">
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              …albo własna kwota ({GIFT_CODE_MIN}-{GIFT_CODE_MAX} zł)
            </span>
            <Input
              type="number"
              inputMode="numeric"
              min={GIFT_CODE_MIN}
              max={GIFT_CODE_MAX}
              step={10}
              value={customAmount}
              placeholder="np. 150"
              onChange={(event) => {
                const raw = event.target.value;
                setCustomAmount(raw);
                if (raw) setAmount(0);
                else setAmount(GIFT_CODE_DENOMINATIONS[1]);
              }}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Kto dostaje kod?
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("self")}
            className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
              mode === "self"
                ? "border-primary bg-primary/10"
                : "border-border/70 bg-background/60 hover:border-primary/30"
            }`}
          >
            <p className="font-semibold text-foreground">Wyślij do mnie</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Sama/sam przekażę kod dalej.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setMode("recipient")}
            className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
              mode === "recipient"
                ? "border-primary bg-primary/10"
                : "border-border/70 bg-background/60 hover:border-primary/30"
            }`}
          >
            <p className="font-semibold text-foreground">Wyślij do obdarowanej/ego</p>
            <p className="mt-1 text-xs text-muted-foreground">
              My dostarczamy mailem z dedykacją.
            </p>
          </button>
        </div>
      </fieldset>

      <label className="block space-y-1.5">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Twój e-mail
        </span>
        <Input
          name="purchaserEmail"
          type="email"
          autoComplete="email"
          required
          placeholder="ty@example.com"
        />
      </label>

      {mode === "recipient" ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                E-mail osoby obdarowanej
              </span>
              <Input
                name="recipientEmail"
                type="email"
                required={mode === "recipient"}
                placeholder="ona@example.com"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Imię (opcjonalnie)
              </span>
              <Input name="recipientName" placeholder="np. Ania" />
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Krótka dedykacja (opcjonalnie)
            </span>
            <Textarea
              name="message"
              rows={3}
              maxLength={400}
              placeholder="Wszystkiego najlepszego — spokojnego czasu z dobrą lekturą."
            />
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={busy || !submittable}>
          {busy ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Przekierowanie do Stripe…
            </>
          ) : (
            <>
              <ShoppingBag className="size-4" />
              Kup voucher{submittable ? ` za ${effectiveAmount} zł` : ""}
            </>
          )}
        </Button>
        {!submittable ? (
          <p className="text-xs text-muted-foreground">
            Kwota musi być w przedziale {GIFT_CODE_MIN}-{GIFT_CODE_MAX} zł.
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

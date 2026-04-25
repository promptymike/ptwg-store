"use client";

import { useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  deleteBundleAction,
  upsertBundleAction,
} from "@/app/actions/bundles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import type { Bundle } from "@/types/store";

type AdminBundleFormProps = {
  bundle?: Bundle | null;
  products: Array<{ id: string; name: string; price: number; category: string }>;
};

const ACCENT_PRESETS: Array<{ label: string; value: string }> = [
  { label: "Złoty", value: "from-[#fbf5ea] via-[#f4ead9] to-[#e4c58d]" },
  { label: "Różowy", value: "from-[#fbcfe8] via-[#f9a8d4] to-[#ec4899]" },
  { label: "Fioletowy", value: "from-[#ddd6fe] via-[#a78bfa] to-[#7c3aed]" },
  { label: "Zielony", value: "from-[#bbf7d0] via-[#86efac] to-[#16a34a]" },
  { label: "Pomarańcz", value: "from-[#fed7aa] via-[#fb923c] to-[#ea580c]" },
];

export function AdminBundleForm({ bundle, products }: AdminBundleFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const initialIds = useMemo(
    () => new Set(bundle?.productIds ?? []),
    [bundle?.productIds],
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(initialIds);
  const [accent, setAccent] = useState(
    bundle?.accent ?? ACCENT_PRESETS[0].value,
  );

  function toggle(productId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  const sumOfSingles = products
    .filter((p) => selectedIds.has(p.id))
    .reduce((sum, p) => sum + p.price, 0);

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        try {
          formData.set("productIds", Array.from(selectedIds).join(","));
          formData.set("accent", accent);
          await upsertBundleAction(formData);
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-5"
    >
      {bundle?.id ? <input type="hidden" name="id" value={bundle.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Nazwa</span>
          <Input
            name="name"
            required
            maxLength={120}
            defaultValue={bundle?.name ?? ""}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Slug (URL)</span>
          <Input
            name="slug"
            required
            maxLength={80}
            pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
            defaultValue={bundle?.slug ?? ""}
            placeholder="pakiet-finanse"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Opis</span>
        <Textarea
          name="description"
          rows={3}
          maxLength={800}
          defaultValue={bundle?.description ?? ""}
          placeholder="2-3 zdania o tym, co i dla kogo."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Cena (zł)</span>
          <Input
            name="price"
            type="number"
            min={0}
            required
            defaultValue={bundle?.price ?? ""}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Cena „przed&rdquo; (zł)
          </span>
          <Input
            name="compareAtPrice"
            type="number"
            min={0}
            defaultValue={bundle?.compareAtPrice ?? ""}
            placeholder={sumOfSingles ? String(sumOfSingles) : ""}
          />
          {sumOfSingles > 0 ? (
            <p className="text-[11px] text-muted-foreground">
              Suma pojedynczych: {formatCurrency(sumOfSingles)}
            </p>
          ) : null}
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Sortowanie</span>
          <Input
            name="sortOrder"
            type="number"
            min={0}
            max={9999}
            defaultValue={bundle?.id ? 100 : 100}
          />
        </label>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">Motyw karty</span>
        <div className="flex flex-wrap gap-2">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setAccent(preset.value)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                accent === preset.value
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border/70 bg-background/60 text-muted-foreground hover:border-primary/30"
              }`}
            >
              <span
                aria-hidden
                className={`size-4 rounded-full bg-gradient-to-br ${preset.value}`}
              />
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">
          Co dostają (po jednej linii)
        </span>
        <Textarea
          name="perks"
          rows={4}
          defaultValue={(bundle?.perks ?? []).join("\n")}
          placeholder={"Dwa pełne ebooki HTML\nDostęp bezterminowy\nFaktura VAT"}
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">
          Produkty w pakiecie ({selectedIds.size})
        </span>
        <div className="grid gap-2 sm:grid-cols-2">
          {products.map((product) => {
            const checked = selectedIds.has(product.id);
            return (
              <label
                key={product.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-2.5 text-sm transition ${
                  checked
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/70 bg-background/60 hover:border-primary/30"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(product.id)}
                  className="mt-1 size-4 shrink-0 accent-[var(--color-foreground)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-foreground">
                    {product.name}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-primary/75">
                    {product.category} · {formatCurrency(product.price)}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={bundle?.id ? true : false}
          className="mt-1 size-4 shrink-0 accent-[var(--color-foreground)]"
        />
        <span>
          <span className="block font-medium text-foreground">
            Opublikowany
          </span>
          <span className="text-muted-foreground">
            Tylko opublikowane pakiety pojawiają się w sekcji /#bundles. Możesz
            zostawić draft, jeśli jeszcze pracujesz nad opisem.
          </span>
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button type="submit" disabled={submitting || selectedIds.size === 0}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Zapisywanie…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Zapisz pakiet
            </>
          )}
        </Button>

        {bundle?.id ? (
          <form action={deleteBundleAction}>
            <input type="hidden" name="id" value={bundle.id} />
            <Button
              type="submit"
              variant="ghost"
              className="text-destructive hover:text-destructive"
            >
              Usuń pakiet
            </Button>
          </form>
        ) : null}
      </div>
    </form>
  );
}

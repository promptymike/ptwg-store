"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";

import { upsertAffiliateAction } from "@/app/actions/affiliates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Affiliate = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  percentCommission: number;
  isActive: boolean;
  notes: string;
};

type AdminAffiliateFormProps = {
  affiliate?: Affiliate;
};

export function AdminAffiliateForm({ affiliate }: AdminAffiliateFormProps) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        try {
          await upsertAffiliateAction(formData);
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4"
    >
      {affiliate?.id ? (
        <input type="hidden" name="id" value={affiliate.id} />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Kod (URL ?ref=...)
          </span>
          <Input
            name="code"
            required
            maxLength={40}
            pattern="[A-Z0-9_-]+"
            defaultValue={affiliate?.code ?? ""}
            placeholder="np. ANIA20"
            className="uppercase"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Imię / nazwa partnera
          </span>
          <Input
            name="name"
            required
            maxLength={120}
            defaultValue={affiliate?.name ?? ""}
            placeholder="np. Anna Kowalska"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Email kontaktowy
          </span>
          <Input
            name="email"
            type="email"
            maxLength={120}
            defaultValue={affiliate?.email ?? ""}
            placeholder="opcjonalny"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Prowizja (%)
          </span>
          <Input
            name="percentCommission"
            type="number"
            min={0}
            max={90}
            step={0.5}
            required
            defaultValue={affiliate?.percentCommission ?? 20}
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">
          Notatki wewnętrzne
        </span>
        <Textarea
          name="notes"
          rows={2}
          maxLength={800}
          defaultValue={affiliate?.notes ?? ""}
          placeholder="np. zniżka 10% dla followersów, kampania marzec, etc."
        />
      </label>

      <label className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={affiliate ? affiliate.isActive : true}
          className="mt-1 size-4 shrink-0 accent-[var(--color-foreground)]"
        />
        <span>
          <span className="block font-medium text-foreground">Aktywny</span>
          <span className="text-muted-foreground">
            Tylko aktywne kody akceptowane są w checkout. Wyłącz, gdy partner
            kończy współpracę.
          </span>
        </span>
      </label>

      <Button type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Zapisywanie…
          </>
        ) : (
          <>
            <Save className="size-4" />
            Zapisz partnera
          </>
        )}
      </Button>
    </form>
  );
}

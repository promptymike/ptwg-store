"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  deleteBlogPostAction,
  upsertBlogPostAction,
} from "@/app/actions/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BlogPostDetail } from "@/lib/supabase/blog";

type AdminBlogFormProps = {
  post?: BlogPostDetail | null;
};

export function AdminBlogForm({ post }: AdminBlogFormProps) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action={async (formData) => {
        setSubmitting(true);
        try {
          await upsertBlogPostAction(formData);
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-5"
    >
      {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Tytuł</span>
          <Input
            name="title"
            required
            maxLength={200}
            defaultValue={post?.title ?? ""}
            placeholder="Jak zacząć budżet domowy w 30 dni"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            Slug (URL)
          </span>
          <Input
            name="slug"
            required
            maxLength={80}
            pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
            defaultValue={post?.slug ?? ""}
            placeholder="jak-zaczac-budzet-domowy"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Lead / excerpt</span>
        <Textarea
          name="excerpt"
          rows={2}
          maxLength={280}
          defaultValue={post?.excerpt ?? ""}
          placeholder="Jedno-dwa zdania, które pojawią się na liście wpisów + w SEO description."
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">
          Treść (Markdown)
        </span>
        <Textarea
          name="body"
          required
          rows={18}
          minLength={20}
          defaultValue={post?.body ?? ""}
          className="font-mono text-sm"
          placeholder={"## Wstęp\n\nKilka zdań o problemie...\n\n## Krok 1: ...\n\n- punkt\n- punkt\n\n[Polecany ebook](/produkty/budzet-domowy)"}
        />
        <p className="text-[11px] text-muted-foreground">
          Markdown: nagłówki ##, listy -, linki [tekst](url), pogrubienie **tekst**, kursywa *tekst*.
        </p>
      </label>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Status</span>
          <select
            name="status"
            defaultValue={post?.status ?? "draft"}
            className="h-12 w-full rounded-2xl border border-input bg-input px-4 text-sm text-foreground"
          >
            <option value="draft">Draft</option>
            <option value="published">Opublikowany</option>
            <option value="archived">Archiwum</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Czas czytania (min)</span>
          <Input
            name="readingMinutes"
            type="number"
            min={1}
            max={60}
            defaultValue={post?.readingMinutes ?? 5}
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-foreground">Tagi (po przecinku)</span>
          <Input
            name="tags"
            defaultValue={(post?.tags ?? []).join(", ")}
            placeholder="finanse, budzet, oszczedzanie"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Zapisywanie…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Zapisz wpis
            </>
          )}
        </Button>

        {post?.id ? (
          <form action={deleteBlogPostAction}>
            <input type="hidden" name="id" value={post.id} />
            <Button
              type="submit"
              variant="ghost"
              className="text-destructive hover:text-destructive"
            >
              Usuń wpis
            </Button>
          </form>
        ) : null}
      </div>
    </form>
  );
}

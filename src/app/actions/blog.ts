"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/lib/session";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Brak autoryzacji");
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Brak Supabase");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Brak uprawnień admina");
  return { userId: user.id };
}

const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const upsertSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")).transform((v) => v || undefined),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Slug minimum 3 znaki.")
    .max(80)
    .regex(slugRegex, "Slug: tylko małe litery, cyfry i myślniki."),
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().max(280).optional().default(""),
  body: z.string().min(20, "Treść minimum 20 znaków."),
  status: z.enum(["draft", "published", "archived"]),
  readingMinutes: z.coerce.number().int().min(1).max(60).default(5),
  tags: z
    .string()
    .optional()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 12),
    ),
});

export async function upsertBlogPostAction(formData: FormData) {
  const { userId } = await ensureAdmin();

  const parsed = upsertSchema.parse({
    id: formData.get("id") ?? "",
    slug: formData.get("slug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt") ?? "",
    body: formData.get("body"),
    status: formData.get("status") ?? "draft",
    readingMinutes: formData.get("readingMinutes") ?? 5,
    tags: formData.get("tags") ?? "",
  });

  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Brak Supabase");

  const payload = {
    slug: parsed.slug,
    title: parsed.title,
    excerpt: parsed.excerpt,
    body: parsed.body,
    status: parsed.status,
    reading_minutes: parsed.readingMinutes,
    tags: parsed.tags,
    author_id: userId,
    published_at:
      parsed.status === "published" ? new Date().toISOString() : null,
  };

  if (parsed.id) {
    const { error } = await supabase
      .from("blog_posts")
      .update(payload)
      .eq("id", parsed.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("blog_posts").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPostAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Brak Supabase");
  await supabase.from("blog_posts").delete().eq("id", id);
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}

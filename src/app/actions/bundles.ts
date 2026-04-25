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
}

const slugRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const upsertSchema = z.object({
  id: z
    .string()
    .uuid()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(80)
    .regex(slugRegex, "Slug: tylko małe litery, cyfry i myślniki."),
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().max(800).optional().default(""),
  price: z.coerce.number().int().min(0).max(100_000),
  compareAtPrice: z.coerce
    .number()
    .int()
    .min(0)
    .max(100_000)
    .optional()
    .or(z.literal(""))
    .transform((v) =>
      typeof v === "number" ? v : v === "" ? undefined : undefined,
    ),
  accent: z.string().trim().max(200).optional().default(
    "from-[#fbf5ea] via-[#f4ead9] to-[#e4c58d]",
  ),
  perks: z
    .string()
    .optional()
    .default("")
    .transform((value) =>
      value
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 12),
    ),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(100),
  isActive: z.coerce.boolean().or(z.literal("on")).optional().default(false),
  productIds: z
    .string()
    .optional()
    .default("")
    .transform((value) => value.split(",").map((v) => v.trim()).filter(Boolean)),
});

export async function upsertBundleAction(formData: FormData) {
  await ensureAdmin();

  const parsed = upsertSchema.parse({
    id: formData.get("id") ?? "",
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") ?? "",
    accent: formData.get("accent") ?? "",
    perks: formData.get("perks") ?? "",
    sortOrder: formData.get("sortOrder") ?? 100,
    isActive: formData.get("isActive") === "on",
    productIds: formData.get("productIds") ?? "",
  });

  if (parsed.productIds.length === 0) {
    throw new Error("Pakiet musi mieć przynajmniej jeden produkt.");
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Brak Supabase");

  const payload = {
    slug: parsed.slug,
    name: parsed.name,
    description: parsed.description,
    price: parsed.price,
    compare_at_price: parsed.compareAtPrice ?? null,
    accent: parsed.accent || "from-[#fbf5ea] via-[#f4ead9] to-[#e4c58d]",
    perks: parsed.perks,
    sort_order: parsed.sortOrder,
    is_active: parsed.isActive === true,
  };

  let bundleId = parsed.id;
  if (bundleId) {
    const { error } = await supabase
      .from("bundles")
      .update(payload)
      .eq("id", bundleId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("bundles")
      .insert(payload)
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message ?? "insert failed");
    bundleId = data.id;
  }

  // Reset bundle_products membership to match the new selection so the
  // admin doesn't need to manage two separate join tables. Order is the
  // index in the submitted list.
  await supabase.from("bundle_products").delete().eq("bundle_id", bundleId);
  if (parsed.productIds.length > 0) {
    const inserts = parsed.productIds.map((productId, idx) => ({
      bundle_id: bundleId!,
      product_id: productId,
      position: idx,
    }));
    const { error } = await supabase.from("bundle_products").insert(inserts);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin/pakiety");
  redirect("/admin/pakiety");
}

export async function deleteBundleAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Brak Supabase");
  await supabase.from("bundles").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/pakiety");
}

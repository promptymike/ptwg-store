"use server";

import { revalidatePath } from "next/cache";
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

const upsertSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")).transform((v) => v || undefined),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3)
    .max(40)
    .regex(/^[A-Z0-9_-]+$/, "Tylko wielkie litery, cyfry, _ i -"),
  name: z.string().trim().min(2).max(120),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
  percentCommission: z.coerce.number().min(0).max(90),
  notes: z.string().trim().max(800).optional().default(""),
  isActive: z.coerce.boolean().or(z.literal("on")).optional().default(false),
});

export async function upsertAffiliateAction(formData: FormData) {
  await ensureAdmin();

  const parsed = upsertSchema.parse({
    id: formData.get("id") ?? "",
    code: formData.get("code"),
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    percentCommission: formData.get("percentCommission") ?? 20,
    notes: formData.get("notes") ?? "",
    isActive: formData.get("isActive") === "on",
  });

  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Brak Supabase");

  const payload = {
    code: parsed.code,
    name: parsed.name,
    email: parsed.email,
    percent_commission: parsed.percentCommission,
    notes: parsed.notes,
    is_active: parsed.isActive === true,
    updated_at: new Date().toISOString(),
  };

  if (parsed.id) {
    const { error } = await supabase
      .from("affiliates")
      .update(payload)
      .eq("id", parsed.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("affiliates").insert(payload);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/afiliacja");
}

export async function deleteAffiliateAction(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Brak Supabase");
  await supabase.from("affiliates").delete().eq("id", id);
  revalidatePath("/admin/afiliacja");
}

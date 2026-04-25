"use server";

import { z } from "zod";

import { getCurrentUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const idsSchema = z.array(z.string().uuid()).max(500);

/**
 * Returns the current user's server-side wishlist as an array of product
 * IDs. Empty when the user is anonymous so the client can keep relying
 * on localStorage without a round-trip.
 */
export async function getServerWishlistIds(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("wishlist_items")
    .select("product_id, added_at")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });
  return (data ?? []).map((row) => row.product_id);
}

/**
 * Two-way merge: server set ∪ client set is written back to the database.
 * Returns the merged set so the client can rewrite localStorage with the
 * same canonical shape across devices.
 */
export async function syncWishlistAction(
  clientProductIds: string[],
): Promise<{ ids: string[] }> {
  const user = await getCurrentUser();
  if (!user) return { ids: clientProductIds };

  const parsed = idsSchema.safeParse(clientProductIds);
  if (!parsed.success) return { ids: [] };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ids: clientProductIds };

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id);
  const serverIds = new Set((existing ?? []).map((row) => row.product_id));
  const merged = new Set([...serverIds, ...parsed.data]);
  const toInsert = parsed.data
    .filter((id) => !serverIds.has(id))
    .map((id) => ({ user_id: user.id, product_id: id }));

  if (toInsert.length > 0) {
    await supabase.from("wishlist_items").insert(toInsert);
  }

  // Validate against products table so we never return ids that no
  // longer exist (e.g. an admin deleted a product after the user
  // wishlisted it).
  const { data: validProducts } = await supabase
    .from("products")
    .select("id")
    .in("id", Array.from(merged));
  const valid = new Set((validProducts ?? []).map((row) => row.id));

  return { ids: Array.from(valid) };
}

const toggleSchema = z.object({
  productId: z.string().uuid(),
  add: z.boolean(),
});

export async function toggleWishlistAction(
  input: z.infer<typeof toggleSchema>,
) {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const };

  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false as const };

  if (parsed.data.add) {
    await supabase.from("wishlist_items").upsert({
      user_id: user.id,
      product_id: parsed.data.productId,
    });
  } else {
    await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", parsed.data.productId);
  }
  return { ok: true as const };
}

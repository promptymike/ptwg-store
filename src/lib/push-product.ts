import "server-only";

import { sendPushToAll, sendPushToUser } from "@/lib/push";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const ANNOUNCEMENT_COOLDOWN_HOURS = 24;
const PRICE_DROP_COOLDOWN_HOURS = 7 * 24;
// We only push if the new price is at least 5% cheaper than the old one —
// avoids pinging wishlisters for cosmetic 1-zł "rounding" tweaks.
const MIN_PRICE_DROP_PERCENT = 5;

/**
 * Announce a freshly published product over web push, with a 24h cooldown
 * per product so we never re-spam if an admin toggles status. Designed to
 * be fire-and-forget — never throws into the caller's request flow.
 */
export async function announceProductPublished(productId: string) {
  try {
    const supabase = createSupabaseAdminClient();
    if (!supabase) return;

    const { data: product } = await supabase
      .from("products")
      .select(
        "id, slug, name, short_description, status, is_active, last_push_announcement_at",
      )
      .eq("id", productId)
      .maybeSingle();

    if (!product || product.status !== "published" || !product.is_active) {
      return;
    }

    if (product.last_push_announcement_at) {
      const lastMs = new Date(product.last_push_announcement_at).getTime();
      const ageMs = Date.now() - lastMs;
      if (ageMs < ANNOUNCEMENT_COOLDOWN_HOURS * 60 * 60 * 1000) {
        return;
      }
    }

    await sendPushToAll({
      title: `Nowość w sklepie: ${product.name}`,
      body: product.short_description.slice(0, 220),
      url: `/produkty/${product.slug}`,
      tag: `product-${product.id}`,
    });

    await supabase
      .from("products")
      .update({ last_push_announcement_at: new Date().toISOString() })
      .eq("id", product.id);
  } catch (err) {
    console.warn("[push] announceProductPublished failed", err);
  }
}

/**
 * Notify wishlisters that a product they care about just got cheaper.
 * Skipped silently if the drop is too small, the cooldown hasn't elapsed,
 * or the product is no longer published. Excludes anyone who already owns
 * a copy from their library.
 */
export async function announcePriceDrop(
  productId: string,
  previousPrice: number,
  newPrice: number,
) {
  try {
    if (newPrice >= previousPrice) return;
    const dropPercent = ((previousPrice - newPrice) / previousPrice) * 100;
    if (dropPercent < MIN_PRICE_DROP_PERCENT) return;

    const supabase = createSupabaseAdminClient();
    if (!supabase) return;

    const { data: product } = await supabase
      .from("products")
      .select(
        "id, slug, name, status, is_active, last_price_drop_push_at",
      )
      .eq("id", productId)
      .maybeSingle();

    if (!product || product.status !== "published" || !product.is_active) {
      return;
    }

    if (product.last_price_drop_push_at) {
      const lastMs = new Date(product.last_price_drop_push_at).getTime();
      const ageMs = Date.now() - lastMs;
      if (ageMs < PRICE_DROP_COOLDOWN_HOURS * 60 * 60 * 1000) {
        return;
      }
    }

    const { data: wishlisters } = await supabase
      .from("wishlist_items")
      .select("user_id")
      .eq("product_id", product.id);

    if (!wishlisters || wishlisters.length === 0) return;

    const wishlisterIds = wishlisters.map((row) => row.user_id);

    // Drop anyone who already owns the product so we don't push them about
    // a discount they can't act on.
    const { data: owners } = await supabase
      .from("library_items")
      .select("user_id")
      .eq("product_id", product.id)
      .in("user_id", wishlisterIds);
    const ownerIds = new Set((owners ?? []).map((row) => row.user_id));
    const targets = wishlisterIds.filter((id) => !ownerIds.has(id));
    if (targets.length === 0) return;

    const roundedDrop = Math.round(dropPercent);
    await Promise.all(
      targets.map((userId) =>
        sendPushToUser(userId, {
          title: `−${roundedDrop}% na: ${product.name}`,
          body: `Cena z Twojej listy życzeń właśnie spadła. Sprawdź zanim zniknie.`,
          url: `/produkty/${product.slug}`,
          tag: `price-drop-${product.id}`,
        }),
      ),
    );

    await supabase
      .from("products")
      .update({ last_price_drop_push_at: new Date().toISOString() })
      .eq("id", product.id);
  } catch (err) {
    console.warn("[push] announcePriceDrop failed", err);
  }
}

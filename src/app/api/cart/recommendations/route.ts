import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";
import {
  getOwnedProductIds,
  getStoreProducts,
} from "@/lib/supabase/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const idsParam = url.searchParams.get("ids") ?? "";
  const cartIds = new Set(
    idsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );

  const [user, products] = await Promise.all([
    getCurrentUser(),
    getStoreProducts(),
  ]);
  const ownedIds = await getOwnedProductIds(user?.id ?? null);

  const cartCategories = new Set(
    products
      .filter((p) => cartIds.has(p.id))
      .map((p) => p.category),
  );

  const candidates = products
    .filter((p) => !cartIds.has(p.id) && !ownedIds.has(p.id))
    .sort((a, b) => {
      // Same-category candidates surface first; bestsellers next; then any.
      const aMatch = cartCategories.has(a.category) ? 0 : 1;
      const bMatch = cartCategories.has(b.category) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      const aBest = a.bestseller ? 0 : 1;
      const bBest = b.bestseller ? 0 : 1;
      if (aBest !== bBest) return aBest - bBest;
      return a.price - b.price;
    })
    .slice(0, 3)
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      shortDescription: product.shortDescription,
      price: product.price,
      coverGradient: product.coverGradient,
    }));

  return NextResponse.json({ items: candidates });
}

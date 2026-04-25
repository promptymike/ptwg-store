import type { Metadata } from "next";

import { WishlistView } from "@/components/account/wishlist-view";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCurrentUser } from "@/lib/session";
import {
  getOwnedProductIds,
  getStoreProducts,
} from "@/lib/supabase/store";

export const metadata: Metadata = {
  title: "Lista życzeń",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  const [products, user] = await Promise.all([
    getStoreProducts(),
    getCurrentUser(),
  ]);
  const ownedIds = await getOwnedProductIds(user?.id ?? null);

  // Slim products into JSON-safe shapes for the client component.
  const slim = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    shortDescription: p.shortDescription,
    price: p.price,
    coverGradient: p.coverGradient,
    coverImageUrl: p.coverImageUrl ?? null,
    coverImageOpacity: p.coverImageOpacity ?? null,
    isOwned: ownedIds.has(p.id),
  }));

  return (
    <div className="shell section-space space-y-8">
      <SectionHeading
        badge="Lista życzeń"
        title="Twoje zaznaczone produkty"
        description="Trzymaj tu ebooki, do których chcesz wrócić. Lista zapisuje się w przeglądarce — nie wymaga konta."
      />
      <WishlistView products={slim} />
    </div>
  );
}

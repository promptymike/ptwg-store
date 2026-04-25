import type { Metadata } from "next";

import { WishlistView } from "@/components/account/wishlist-view";
import { WishlistSharedView } from "@/components/account/wishlist-shared-view";
import { SectionHeading } from "@/components/shared/section-heading";
import { decodeShareToken } from "@/lib/wishlist-share";
import { getCurrentUser } from "@/lib/session";
import {
  getOwnedProductIds,
  getStoreProducts,
} from "@/lib/supabase/store";

export const metadata: Metadata = {
  title: "Lista życzeń",
  robots: { index: false, follow: false },
};

type WishlistPageProps = {
  searchParams: Promise<{ share?: string }>;
};

export default async function WishlistPage({
  searchParams,
}: WishlistPageProps) {
  const [products, user, params] = await Promise.all([
    getStoreProducts(),
    getCurrentUser(),
    searchParams,
  ]);
  const ownedIds = await getOwnedProductIds(user?.id ?? null);

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

  // ?share=... renders a read-only wishlist someone else linked to.
  // Useful for "to są ebooki które chcę dostać na urodziny" share flows
  // — the recipient can heart items into their own list with one click.
  if (params.share) {
    const sharedIds = decodeShareToken(params.share);
    const sharedProducts = sharedIds
      .map((id) => slim.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    return (
      <div className="shell section-space space-y-8">
        <SectionHeading
          badge="Udostępniona lista życzeń"
          title="Komuś marzą się te ebooki"
          description="Ktoś podzielił się swoją listą życzeń. Możesz każdą pozycję dorzucić do własnej listy lub od razu kupić."
        />
        <WishlistSharedView products={sharedProducts} />
      </div>
    );
  }

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

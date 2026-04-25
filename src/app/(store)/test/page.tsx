import type { Metadata } from "next";

import { PersonalityTest } from "@/components/test/personality-test";
import { getCurrentUser } from "@/lib/session";
import {
  getOwnedProductIds,
  getStoreProducts,
} from "@/lib/supabase/store";

export const metadata: Metadata = {
  title: "Test stylu pracy — Big Five w 2 minuty",
  description:
    "Bezpłatny naukowy test osobowości TIPI (Big Five). Poznaj swoje mocne strony, obszary do pilnowania i ebooki dopasowane do Twojego stylu pracy.",
};

export default async function TestPage() {
  const [products, user] = await Promise.all([
    getStoreProducts(),
    getCurrentUser(),
  ]);
  const ownedProductIds = await getOwnedProductIds(user?.id ?? null);

  // Strip server-only fields the test never needs to keep the prop tree
  // small and JSON-serialisable for the client component boundary.
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
  }));

  return (
    <div className="shell section-space">
      <div className="mx-auto max-w-4xl">
        <PersonalityTest
          products={slim}
          ownedProductIds={Array.from(ownedProductIds)}
        />
      </div>
    </div>
  );
}

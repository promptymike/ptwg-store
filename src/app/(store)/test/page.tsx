import { PersonalityTest } from "@/components/test/personality-test";
import { getCurrentUser } from "@/lib/session";
import { buildCanonicalMetadata } from "@/lib/seo";
import {
  getOwnedProductIds,
  getStoreProducts,
} from "@/lib/supabase/store";

export const metadata = buildCanonicalMetadata({
  title: "Test dopasowania planera i e-booka — 2 minuty",
  description:
    "Bezpłatny test stylu działania oparty na Big Five. Poznaj swój profil i otrzymaj konkretne planery oraz e-booki dopasowane do Twoich potrzeb.",
  path: "/test",
});

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

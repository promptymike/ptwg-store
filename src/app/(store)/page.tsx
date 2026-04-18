import type { Metadata } from "next";

import { BestsellersSection } from "@/components/sections/bestsellers-section";
import { BundlesSection } from "@/components/sections/bundles-section";
import { CatalogSection } from "@/components/sections/catalog-section";
import { CtaSection } from "@/components/sections/cta-section";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { categoryHighlights, storeStats } from "@/data/mock-store";
import { buildCanonicalMetadata } from "@/lib/seo";
import { getStorefrontSnapshot } from "@/lib/supabase/store";

function getSectionOrFallback(
  sections: Awaited<ReturnType<typeof getStorefrontSnapshot>>["sections"],
  key: string,
) {
  return sections.find((section) => section.key === key) ?? sections[0];
}

export const metadata: Metadata = buildCanonicalMetadata({
  title: "Templify | Premium szablony cyfrowe i gotowe systemy pracy",
  description:
    "Szablony Notion, plannery i systemy operacyjne zaprojektowane dla założycieli, studiów i konsultantów. Natychmiastowy dostęp, bezterminowa licencja, 14 dni na zwrot.",
  path: "/",
});

export default async function HomePage() {
  const { sections, featuredProducts, bestsellerProducts, recommendedBundle, faqs } =
    await getStorefrontSnapshot();

  return (
    <>
      <HeroSection content={getSectionOrFallback(sections, "hero")} stats={storeStats} />
      <BestsellersSection
        content={getSectionOrFallback(sections, "featured")}
        products={bestsellerProducts.length > 0 ? bestsellerProducts : featuredProducts}
      />
      <CatalogSection
        content={getSectionOrFallback(sections, "use-cases")}
        categories={categoryHighlights}
      />
      <BundlesSection recommendedBundle={recommendedBundle} />
      <FaqSection content={getSectionOrFallback(sections, "faq")} faqs={faqs} />
      <CtaSection />
    </>
  );
}

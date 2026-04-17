import { BestsellersSection } from "@/components/sections/bestsellers-section";
import { BundlesSection } from "@/components/sections/bundles-section";
import { CatalogSection } from "@/components/sections/catalog-section";
import { CtaSection } from "@/components/sections/cta-section";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { StatsSection } from "@/components/sections/stats-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { WhyTemplifySection } from "@/components/sections/why-templify-section";
import { categoryHighlights, storeStats } from "@/data/mock-store";
import { getStorefrontSnapshot } from "@/lib/supabase/store";

function getSectionOrFallback(
  sections: Awaited<ReturnType<typeof getStorefrontSnapshot>>["sections"],
  key: string,
) {
  return sections.find((section) => section.key === key) ?? sections[0];
}

export default async function HomePage() {
  const { sections, featuredProducts, faqs, testimonials } =
    await getStorefrontSnapshot();

  return (
    <>
      <HeroSection content={getSectionOrFallback(sections, "hero")} stats={storeStats} />
      <StatsSection stats={storeStats} />
      <BestsellersSection
        content={getSectionOrFallback(sections, "featured")}
        products={featuredProducts}
      />
      <CatalogSection
        content={getSectionOrFallback(sections, "use-cases")}
        categories={categoryHighlights}
      />
      <WhyTemplifySection content={getSectionOrFallback(sections, "why-templify")} />
      <BundlesSection />
      <HowItWorksSection content={getSectionOrFallback(sections, "how-it-works")} />
      <TestimonialsSection testimonials={testimonials} />
      <FaqSection content={getSectionOrFallback(sections, "faq")} faqs={faqs} />
      <CtaSection />
    </>
  );
}

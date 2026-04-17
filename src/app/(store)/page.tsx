import { BestsellersSection } from "@/components/sections/bestsellers-section";
import { BundlesSection } from "@/components/sections/bundles-section";
import { CatalogSection } from "@/components/sections/catalog-section";
import { CtaSection } from "@/components/sections/cta-section";
import { HeroSection } from "@/components/sections/hero-section";
import { StatsSection } from "@/components/sections/stats-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <BestsellersSection />
      <CatalogSection />
      <BundlesSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}

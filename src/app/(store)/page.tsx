import type { Metadata } from "next";

import { BestsellersSection } from "@/components/sections/bestsellers-section";
import { BundlesSection } from "@/components/sections/bundles-section";
import { CatalogSection } from "@/components/sections/catalog-section";
import { CtaSection } from "@/components/sections/cta-section";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { NewArrivalsSection } from "@/components/sections/new-arrivals-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { categoryHighlights, storeStats } from "@/data/mock-store";
import { buildCanonicalMetadata, getCanonicalUrl } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import {
  getOwnedProductIds,
  getStorefrontSnapshot,
} from "@/lib/supabase/store";

function getSectionOrFallback(
  sections: Awaited<ReturnType<typeof getStorefrontSnapshot>>["sections"],
  key: string,
) {
  return sections.find((section) => section.key === key) ?? sections[0];
}

export const metadata: Metadata = buildCanonicalMetadata({
  title: "Praktyczne ebooki i planery dla codziennego życia",
  description:
    "Konkretne ebooki i planery: finanse, zdrowie, macierzyństwo, produktywność, kariera, podróże. Napisane przez praktyków. Natychmiastowy dostęp, bezterminowa licencja, 14 dni na zwrot.",
  path: "/",
});

export default async function HomePage() {
  const {
    sections,
    featuredProducts,
    bestsellerProducts,
    newArrivalProducts,
    bundles,
    recommendedBundle,
    faqs,
  } = await getStorefrontSnapshot();

  const user = await getCurrentUser();
  const ownedProductIds = await getOwnedProductIds(user?.id ?? null);

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Templify",
    url: getCanonicalUrl("/"),
    logo: getCanonicalUrl("/opengraph-image"),
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "kontakt@templify.store",
        availableLanguage: ["Polish"],
      },
    ],
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Templify",
    url: getCanonicalUrl("/"),
    inLanguage: "pl-PL",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getCanonicalUrl("/produkty")}?kategoria={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const faqStructuredData =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      {faqStructuredData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      ) : null}
      <HeroSection content={getSectionOrFallback(sections, "hero")} stats={storeStats} />
      <BestsellersSection
        content={getSectionOrFallback(sections, "featured")}
        products={bestsellerProducts.length > 0 ? bestsellerProducts : featuredProducts}
        ownedProductIds={ownedProductIds}
      />
      <NewArrivalsSection
        products={newArrivalProducts}
        ownedProductIds={ownedProductIds}
      />
      <CatalogSection
        content={getSectionOrFallback(sections, "use-cases")}
        categories={categoryHighlights}
      />
      <BundlesSection
        bundles={bundles}
        recommendedBundle={recommendedBundle}
        ownedProductIds={ownedProductIds}
      />
      <FaqSection content={getSectionOrFallback(sections, "faq")} faqs={faqs} />
      <NewsletterSection />
      <CtaSection />
    </>
  );
}

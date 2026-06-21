import type { Metadata } from "next";

import { BestsellersSection } from "@/components/sections/bestsellers-section";
import { BundlesSection } from "@/components/sections/bundles-section";
import { CatalogSection } from "@/components/sections/catalog-section";
import { CtaSection } from "@/components/sections/cta-section";
import { FaqSection } from "@/components/sections/faq-section";
import { InteractivePlannerHero } from "@/components/sections/interactive-planner-hero";
import { NewArrivalsSection } from "@/components/sections/new-arrivals-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";
import { categoryHighlights } from "@/data/mock-store";
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
  title: "Interaktywne planery — skończ z Excelem",
  description:
    "Najlepsze interaktywne planery do finansów, rodziny, posiłków i pracy. Automatyczny zapis i dostęp prosto z telefonu.",
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
    categoryProductCounts,
  } = await getStorefrontSnapshot();

  const user = await getCurrentUser();
  const ownedProductIds = await getOwnedProductIds(user?.id ?? null);

  // Drop kategorie tiles whose DB count is 0 so we never link visitors into
  // an empty filter page (e.g. "Podróże i lifestyle" before any product
  // lands in that bucket). Counts come from the storefront snapshot so the
  // section renders zero queries beyond what the homepage already issues.
  const populatedCategoryHighlights = categoryHighlights.filter(
    (category) => (categoryProductCounts[category.title] ?? 0) > 0,
  );

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
      <InteractivePlannerHero />
      <BestsellersSection
        content={getSectionOrFallback(sections, "featured")}
        products={bestsellerProducts.length > 0 ? bestsellerProducts : featuredProducts}
        ownedProductIds={ownedProductIds}
      />
      <NewArrivalsSection
        products={newArrivalProducts}
        ownedProductIds={ownedProductIds}
      />
      {populatedCategoryHighlights.length > 0 ? (
        <CatalogSection
          content={getSectionOrFallback(sections, "use-cases")}
          categories={populatedCategoryHighlights}
          categoryProductCounts={categoryProductCounts}
        />
      ) : null}
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

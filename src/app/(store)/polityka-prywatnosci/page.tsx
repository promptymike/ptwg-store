import type { Metadata } from "next";

import { LegalPageTemplate } from "@/components/legal/legal-page-template";
import { buildCanonicalMetadata } from "@/lib/seo";
import { getContentPageBySlug } from "@/lib/supabase/store";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPageBySlug("polityka-prywatnosci");

  return buildCanonicalMetadata({
    title: page?.title ?? "Polityka prywatności",
    description:
      page?.description ?? "Zasady przetwarzania danych osobowych w sklepie Templify.",
    path: "/polityka-prywatnosci",
  });
}

export default function PrivacyPolicyPage() {
  return <LegalPageTemplate slug="polityka-prywatnosci" />;
}

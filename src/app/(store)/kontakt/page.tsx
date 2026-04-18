import type { Metadata } from "next";

import { LegalPageTemplate } from "@/components/legal/legal-page-template";
import { buildCanonicalMetadata } from "@/lib/seo";
import { getContentPageBySlug } from "@/lib/supabase/store";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPageBySlug("kontakt");

  return buildCanonicalMetadata({
    title: `${page?.title ?? "Kontakt"} | Templify`,
    description:
      page?.description ?? "Skontaktuj się z zespołem Templify.",
    path: "/kontakt",
  });
}

export default function ContactPage() {
  return <LegalPageTemplate slug="kontakt" />;
}

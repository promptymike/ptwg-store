import type { Metadata } from "next";

import { LegalPageTemplate } from "@/components/legal/legal-page-template";
import { buildCanonicalMetadata } from "@/lib/seo";
import { getContentPageBySlug } from "@/lib/supabase/store";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPageBySlug("regulamin");

  return buildCanonicalMetadata({
    title: `${page?.title ?? "Regulamin"} | Templify`,
    description:
      page?.description ?? "Warunki korzystania ze sklepu i zakupu produktów cyfrowych.",
    path: "/regulamin",
  });
}

export default function TermsPage() {
  return <LegalPageTemplate slug="regulamin" />;
}

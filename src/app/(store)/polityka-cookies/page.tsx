import type { Metadata } from "next";

import { LegalPageTemplate } from "@/components/legal/legal-page-template";
import { buildCanonicalMetadata } from "@/lib/seo";
import { getContentPageBySlug } from "@/lib/supabase/store";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPageBySlug("polityka-cookies");

  return buildCanonicalMetadata({
    title: `${page?.title ?? "Polityka cookies"} | Templify`,
    description:
      page?.description ?? "Informacje o wykorzystaniu plików cookies i zgodach użytkownika.",
    path: "/polityka-cookies",
  });
}

export default function CookiesPolicyPage() {
  return <LegalPageTemplate slug="polityka-cookies" />;
}

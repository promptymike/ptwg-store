import type { Metadata } from "next";

import { PolitykaPrywatnosciContent } from "@/components/legal/polityka-prywatnosci-content";
import { buildCanonicalMetadata } from "@/lib/seo";

// The privacy policy is code-owned (final legal text audited by the payment
// operator) — it intentionally does NOT read from content_pages anymore.
export function generateMetadata(): Metadata {
  return buildCanonicalMetadata({
    title: "Polityka prywatności",
    description:
      "Polityka prywatności templify.pl — jakie dane przetwarzamy, na jakich podstawach prawnych, komu je powierzamy i jakie prawa przysługują Ci na gruncie RODO.",
    path: "/polityka-prywatnosci",
  });
}

export default function PrivacyPolicyPage() {
  return <PolitykaPrywatnosciContent />;
}

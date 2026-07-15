import type { Metadata } from "next";

import { RegulaminContent } from "@/components/legal/regulamin-content";
import { buildCanonicalMetadata } from "@/lib/seo";

// The regulamin is code-owned (final legal text audited by the payment
// operator) — it intentionally does NOT read from content_pages anymore.
export function generateMetadata(): Metadata {
  return buildCanonicalMetadata({
    title: "Regulamin",
    description:
      "Regulamin serwisu templify.pl — zasady zakupów treści cyfrowych, płatności HotPay, reklamacje, odstąpienie od umowy i licencja na korzystanie z produktów.",
    path: "/regulamin",
  });
}

export default function TermsPage() {
  return <RegulaminContent />;
}

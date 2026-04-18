import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/produkty", "/produkty/"],
      disallow: ["/admin", "/konto", "/biblioteka", "/checkout", "/logowanie", "/rejestracja"],
    },
    sitemap: `${env.siteUrl}/sitemap.xml`,
    host: env.siteUrl,
  };
}

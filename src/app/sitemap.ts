import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import { getLegalPagesSnapshot, getStoreProducts } from "@/lib/supabase/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, legalPages] = await Promise.all([
    getStoreProducts(),
    getLegalPagesSnapshot(),
  ]);

  const baseUrl = env.siteUrl;

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/produkty`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...products.map((product) => ({
      url: `${baseUrl}/produkty/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...legalPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}

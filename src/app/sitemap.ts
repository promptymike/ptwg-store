import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import { getPublishedBlogPosts } from "@/lib/supabase/blog";
import { getLegalPagesSnapshot, getStoreProducts } from "@/lib/supabase/store";
import { getInteractivePlanner, interactivePlanners } from "@/data/interactive-planners";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, legalPages, blogPosts] = await Promise.all([
    getStoreProducts(),
    getLegalPagesSnapshot(),
    getPublishedBlogPosts(),
  ]);

  const baseUrl = env.siteUrl;
  const now = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/produkty`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/planery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/test`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pomoc`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...products.filter((product) => !getInteractivePlanner(product.slug)).map((product) => ({
      url: `${baseUrl}/produkty/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...interactivePlanners.map((planner) => ({
      url: `${baseUrl}/planery/${planner.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...legalPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}

import "server-only";

import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { createProductCoverSignedUrl } from "@/lib/supabase/storage";
import type { Tables } from "@/types/database.types";

export type BlogPostStatus = "draft" | "published" | "archived";

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  readingMinutes: number;
  tags: string[];
  status: BlogPostStatus;
};

export type BlogPostDetail = BlogPostSummary & {
  body: string;
  authorName: string | null;
  relatedProductIds: string[];
};

type BlogRow = Tables<"blog_posts"> & {
  profiles?: { full_name: string | null } | null;
};

async function withCover(row: BlogRow): Promise<BlogPostDetail> {
  const coverImageUrl = row.cover_path
    ? await createProductCoverSignedUrl(row.cover_path, 3600)
    : null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: coverImageUrl ?? null,
    publishedAt: row.published_at,
    readingMinutes: row.reading_minutes,
    tags: row.tags,
    status: row.status as BlogPostStatus,
    body: row.body,
    authorName: row.profiles?.full_name ?? null,
    relatedProductIds: row.related_product_ids,
  };
}

export async function getPublishedBlogPosts(): Promise<BlogPostSummary[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, cover_path, published_at, reading_minutes, tags, status",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error || !data) return [];

  const rows = data as Array<Pick<Tables<"blog_posts">,
    "id" | "slug" | "title" | "excerpt" | "cover_path" | "published_at" | "reading_minutes" | "tags" | "status"
  >>;

  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      coverImageUrl: row.cover_path
        ? (await createProductCoverSignedUrl(row.cover_path, 3600)) ?? null
        : null,
      publishedAt: row.published_at,
      readingMinutes: row.reading_minutes,
      tags: row.tags,
      status: row.status as BlogPostStatus,
    })),
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, profiles(full_name)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data) return null;
  return withCover(data as BlogRow);
}

export async function getAdminBlogPosts(): Promise<BlogPostSummary[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, excerpt, cover_path, published_at, reading_minutes, tags, status",
    )
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImageUrl: null,
    publishedAt: row.published_at,
    readingMinutes: row.reading_minutes,
    tags: row.tags,
    status: row.status as BlogPostStatus,
  }));
}

export async function getAdminBlogPostBySlug(
  slug: string,
): Promise<BlogPostDetail | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, profiles(full_name)")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return withCover(data as BlogRow);
}

export async function getAllBlogSlugs(): Promise<string[]> {
  // Uses the admin client because generateStaticParams runs at build
  // time without a request — server client would crash trying to read
  // cookies(). Public-only data either way.
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published");
  return (data ?? []).map((row) => row.slug);
}

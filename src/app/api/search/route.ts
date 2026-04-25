import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ProductHit = {
  type: "product";
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  price: number;
  href: string;
};

type BlogHit = {
  type: "blog";
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  href: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    return NextResponse.json({
      query,
      products: [] as ProductHit[],
      blog: [] as BlogHit[],
    });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({
      query,
      products: [] as ProductHit[],
      blog: [] as BlogHit[],
    });
  }

  // Postgres ilike pattern, case-insensitive substring match. Escape % and _
  // so user input "100% off" doesn't accidentally widen the match.
  const safe = query.replace(/[%_]/g, "\\$&");
  const pattern = `%${safe}%`;

  const [productsRes, blogRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, name, short_description, price, categories(name)",
      )
      .eq("status", "published")
      .or(
        `name.ilike.${pattern},short_description.ilike.${pattern},description.ilike.${pattern}`,
      )
      .limit(8),
    supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt")
      .eq("status", "published")
      .or(
        `title.ilike.${pattern},excerpt.ilike.${pattern},body.ilike.${pattern}`,
      )
      .limit(6),
  ]);

  type ProductRow = {
    id: string;
    slug: string;
    name: string;
    short_description: string | null;
    price: number;
    categories: { name: string } | { name: string }[] | null;
  };

  const products: ProductHit[] = ((productsRes.data as ProductRow[]) ?? []).map(
    (row) => {
      const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
      return {
        type: "product",
        id: row.id,
        slug: row.slug,
        title: row.name,
        excerpt: row.short_description ?? "",
        category: cat?.name ?? null,
        price: row.price,
        href: `/produkty/${row.slug}`,
      };
    },
  );

  const blog: BlogHit[] = (blogRes.data ?? []).map((row) => ({
    type: "blog",
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    href: `/blog/${row.slug}`,
  }));

  return NextResponse.json({ query, products, blog });
}

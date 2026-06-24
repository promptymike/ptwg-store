import "server-only";

import { getInteractivePlanner } from "@/data/interactive-planners";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SearchProductHit = {
  type: "product";
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  price: number;
  href: string;
};

export type SearchBlogHit = {
  type: "blog";
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  href: string;
};

export type SearchResults = {
  query: string;
  products: SearchProductHit[];
  blog: SearchBlogHit[];
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number;
  format: string | null;
  tags: string[] | null;
  categories: { name: string } | { name: string }[] | null;
};

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
};

function normalizeSearchText(input: string | null | undefined) {
  return (input ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase();
}

function getCategoryName(
  categories: ProductRow["categories"],
): string | null {
  const category = Array.isArray(categories) ? categories[0] : categories;
  return category?.name ?? null;
}

function productSearchHaystack(row: ProductRow) {
  return normalizeSearchText(
    [
      row.name,
      row.short_description,
      row.description,
      row.format,
      getCategoryName(row.categories),
      ...(row.tags ?? []),
      getInteractivePlanner(row.slug) ? "planer interaktywny template szablon" : "ebook e-book pdf",
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function scoreProduct(row: ProductRow, normalizedQuery: string) {
  const normalizedName = normalizeSearchText(row.name);
  const normalizedCategory = normalizeSearchText(getCategoryName(row.categories));
  const normalizedTags = normalizeSearchText((row.tags ?? []).join(" "));
  const haystack = productSearchHaystack(row);

  if (normalizedName === normalizedQuery) return 0;
  if (normalizedName.includes(normalizedQuery)) return 1;
  if (normalizedCategory.includes(normalizedQuery)) return 2;
  if (normalizedTags.includes(normalizedQuery)) return 3;
  if (haystack.includes(normalizedQuery)) return 4;
  return 99;
}

export async function findSearchResults(
  query: string,
  options?: { productLimit?: number; blogLimit?: number },
): Promise<SearchResults> {
  const trimmed = query.trim();
  const empty = { query: trimmed, products: [], blog: [] };

  if (trimmed.length < 2) return empty;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return empty;

  const productLimit = options?.productLimit ?? 8;
  const blogLimit = options?.blogLimit ?? 6;
  const normalizedQuery = normalizeSearchText(trimmed);

  const [productsRes, blogRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, name, short_description, description, price, format, tags, categories(name)",
      )
      .eq("status", "published")
      .order("featured_order", { ascending: true })
      .order("sort_order", { ascending: true })
      .limit(80),
    supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, body")
      .eq("status", "published")
      .limit(80),
  ]);

  const products: SearchProductHit[] = ((productsRes.data as ProductRow[]) ?? [])
    .map((row) => ({ row, score: scoreProduct(row, normalizedQuery) }))
    .filter((item) => item.score < 99)
    .sort((a, b) => a.score - b.score || a.row.name.localeCompare(b.row.name, "pl"))
    .slice(0, productLimit)
    .map(({ row }) => {
      const category = getCategoryName(row.categories);
      const planner = getInteractivePlanner(row.slug);
      return {
        type: "product",
        id: row.id,
        slug: row.slug,
        title: row.name,
        excerpt: row.short_description ?? "",
        category,
        price: row.price,
        href: planner ? `/planery/${row.slug}` : `/produkty/${row.slug}`,
      };
    });

  const blog: SearchBlogHit[] = ((blogRes.data as BlogRow[]) ?? [])
    .filter((row) =>
      normalizeSearchText([row.title, row.excerpt, row.body].join(" ")).includes(
        normalizedQuery,
      ),
    )
    .slice(0, blogLimit)
    .map((row) => ({
      type: "blog",
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt ?? "",
      href: `/blog/${row.slug}`,
    }));

  return { query: trimmed, products, blog };
}

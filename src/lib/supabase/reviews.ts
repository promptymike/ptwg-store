import "server-only";

import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";

export type ProductReview = {
  id: string;
  productId: string;
  rating: number;
  title: string;
  body: string;
  authorName: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
};

export type ReviewSummary = {
  count: number;
  average: number;
  /** Map rating (1-5) → count of reviews with that rating. */
  histogram: Record<number, number>;
};

type ReviewRow = Tables<"product_reviews"> & {
  profiles?: { full_name: string | null; email: string } | null;
};

function maskName(profile: ReviewRow["profiles"]) {
  if (!profile) return "Anonim";
  if (profile.full_name && profile.full_name.trim()) {
    const parts = profile.full_name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  }
  if (profile.email) {
    const local = profile.email.split("@")[0];
    if (local.length <= 3) return `${local}***`;
    return `${local.slice(0, 2)}***`;
  }
  return "Anonim";
}

export async function getApprovedReviewsForProduct(
  productId: string,
): Promise<ProductReview[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("product_reviews")
    .select(
      "id, product_id, rating, title, body, is_verified_purchase, created_at, profiles(full_name, email)",
    )
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return (data as ReviewRow[]).map((row) => ({
    id: row.id,
    productId: row.product_id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    authorName: maskName(row.profiles),
    isVerifiedPurchase: row.is_verified_purchase,
    createdAt: row.created_at,
  }));
}

export function summariseReviews(reviews: ProductReview[]): ReviewSummary {
  if (reviews.length === 0) {
    return { count: 0, average: 0, histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }
  const histogram: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const review of reviews) {
    histogram[review.rating] = (histogram[review.rating] ?? 0) + 1;
    sum += review.rating;
  }
  return {
    count: reviews.length,
    average: Number((sum / reviews.length).toFixed(2)),
    histogram,
  };
}

export async function getCustomerReviewForProduct(
  userId: string,
  productId: string,
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, rating, title, body, status, created_at")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    rating: data.rating,
    title: data.title,
    body: data.body,
    status: data.status,
    createdAt: data.created_at,
  };
}

export type AdminPendingReview = ProductReview & {
  status: "pending" | "approved" | "rejected";
  productName: string;
  productSlug: string;
  authorEmail: string;
};

export async function getAdminReviewsSnapshot(
  status: "pending" | "approved" | "rejected" | "all" = "pending",
): Promise<AdminPendingReview[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  let query = supabase
    .from("product_reviews")
    .select(
      "id, product_id, rating, title, body, status, is_verified_purchase, created_at, products(name, slug), profiles(full_name, email)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (status !== "all") {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error || !data) return [];

  type Row = ReviewRow & {
    products?: { name: string; slug: string } | null;
  };
  return (data as Row[]).map((row) => ({
    id: row.id,
    productId: row.product_id,
    rating: row.rating,
    title: row.title,
    body: row.body,
    status: row.status,
    productName: row.products?.name ?? "—",
    productSlug: row.products?.slug ?? "",
    authorName: maskName(row.profiles),
    authorEmail: row.profiles?.email ?? "",
    isVerifiedPurchase: row.is_verified_purchase,
    createdAt: row.created_at,
  }));
}

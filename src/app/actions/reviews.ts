"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/session";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

const submitSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(""),
  body: z.string().trim().min(20, "Opinia musi mieć co najmniej 20 znaków.").max(800),
});

export type SubmitReviewState =
  | { status: "idle" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

export async function submitReviewAction(
  _prev: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Zaloguj się, aby dodać opinię." };
  }

  const parsed = submitSchema.safeParse({
    productId: formData.get("productId"),
    rating: Number(formData.get("rating")),
    title: formData.get("title") ?? "",
    body: formData.get("body") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Sprawdź dane formularza.",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Brak konfiguracji Supabase." };
  }

  // Confirm the buyer actually owns the product before letting RLS reject
  // — this gives a clearer error than a generic permission denied.
  const { data: ownership } = await supabase
    .from("library_items")
    .select("id, order_id")
    .eq("user_id", user.id)
    .eq("product_id", parsed.data.productId)
    .maybeSingle();

  if (!ownership) {
    return {
      status: "error",
      message:
        "Opinię może dodać tylko osoba, która ma ten produkt w bibliotece.",
    };
  }

  const { error } = await supabase.from("product_reviews").upsert(
    {
      product_id: parsed.data.productId,
      user_id: user.id,
      order_id: ownership.order_id,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      is_verified_purchase: Boolean(ownership.order_id),
      status: "pending",
    },
    { onConflict: "product_id,user_id" },
  );

  if (error) {
    return {
      status: "error",
      message: error.message || "Nie udało się zapisać opinii.",
    };
  }

  revalidatePath("/produkty");
  revalidatePath(`/produkty/${parsed.data.productId}`);

  return {
    status: "ok",
    message: "Dziękujemy! Opinia trafiła do moderacji — pojawi się po zatwierdzeniu.",
  };
}

const moderationSchema = z.object({
  reviewId: z.string().uuid(),
  nextStatus: z.enum(["approved", "rejected"]),
});

export async function moderateReviewAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Brak autoryzacji");

  const adminSupabase = createSupabaseAdminClient();
  const supabase = await createSupabaseServerClient();
  if (!adminSupabase || !supabase) throw new Error("Brak Supabase");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Brak uprawnień admina");

  const parsed = moderationSchema.parse({
    reviewId: formData.get("reviewId"),
    nextStatus: formData.get("nextStatus"),
  });

  await adminSupabase
    .from("product_reviews")
    .update({ status: parsed.nextStatus })
    .eq("id", parsed.reviewId);

  revalidatePath("/admin/recenzje");
  revalidatePath("/produkty");
}

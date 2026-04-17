"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  PRODUCT_COVERS_BUCKET,
  PRODUCT_FILES_BUCKET,
  removeStorageFile,
  uploadStorageFile,
} from "@/lib/supabase/storage";
import {
  categoryFormSchema,
  productFormSchema,
} from "@/lib/validations/admin";

function slugifyFilename(filename: string) {
  const normalized = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "plik";
}

function parseCheckbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function parseList(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function ensureAdmin() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    throw new Error("Brak uprawnień administratora.");
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Brak konfiguracji Supabase.");
  }

  return { profile, supabase };
}

function redirectWithMessage(path: string, type: "success" | "error", message: string) {
  redirect(`${path}?type=${type}&message=${encodeURIComponent(message)}`);
}

async function uploadProductAssets(params: {
  productId: string;
  slug: string;
  coverFile?: File | null;
  productFile?: File | null;
  previousCoverPath?: string | null;
  previousFilePath?: string | null;
}) {
  let coverPath = params.previousCoverPath ?? null;
  let filePath = params.previousFilePath ?? null;

  if (params.coverFile && params.coverFile.size > 0) {
    const nextCoverPath = `products/${params.productId}/covers/${Date.now()}-${slugifyFilename(params.coverFile.name)}`;
    const uploadResult = await uploadStorageFile(
      PRODUCT_COVERS_BUCKET,
      nextCoverPath,
      params.coverFile,
    );

    if (uploadResult.error) {
      throw new Error(`Nie udało się wgrać okładki: ${uploadResult.error.message}`);
    }

    if (coverPath && coverPath !== nextCoverPath) {
      await removeStorageFile(PRODUCT_COVERS_BUCKET, coverPath);
    }

    coverPath = nextCoverPath;
  }

  if (params.productFile && params.productFile.size > 0) {
    const nextFilePath = `products/${params.productId}/files/${Date.now()}-${slugifyFilename(params.productFile.name)}`;
    const uploadResult = await uploadStorageFile(
      PRODUCT_FILES_BUCKET,
      nextFilePath,
      params.productFile,
    );

    if (uploadResult.error) {
      throw new Error(`Nie udało się wgrać pliku produktu: ${uploadResult.error.message}`);
    }

    if (filePath && filePath !== nextFilePath) {
      await removeStorageFile(PRODUCT_FILES_BUCKET, filePath);
    }

    filePath = nextFilePath;
  }

  return { coverPath, filePath };
}

export async function createCategoryAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Kategoria została utworzona.";

  try {
    const { supabase } = await ensureAdmin();

    const parsed = categoryFormSchema.safeParse({
      slug: formData.get("slug"),
      name: formData.get("name"),
      description: formData.get("description"),
      sortOrder: formData.get("sortOrder"),
      isActive: parseCheckbox(formData.get("isActive")),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Niepoprawne dane kategorii.");
    }

    const { error } = await supabase.from("categories").insert({
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive ?? false,
    });

    if (error) {
      throw error;
    }

    revalidatePath("/admin/kategorie");
    revalidatePath("/produkty");
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error
        ? error.message
        : "Nie udało się utworzyć kategorii.";
  }

  redirectWithMessage("/admin/kategorie", redirectType, redirectMessage);
}

export async function updateCategoryAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Kategoria została zaktualizowana.";

  try {
    const { supabase } = await ensureAdmin();

    const parsed = categoryFormSchema.safeParse({
      categoryId: formData.get("categoryId"),
      slug: formData.get("slug"),
      name: formData.get("name"),
      description: formData.get("description"),
      sortOrder: formData.get("sortOrder"),
      isActive: parseCheckbox(formData.get("isActive")),
    });

    if (!parsed.success || !parsed.data.categoryId) {
      throw new Error(parsed.error?.issues[0]?.message ?? "Niepoprawne dane kategorii.");
    }

    const { error } = await supabase
      .from("categories")
      .update({
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        sort_order: parsed.data.sortOrder,
        is_active: parsed.data.isActive ?? false,
      })
      .eq("id", parsed.data.categoryId);

    if (error) {
      throw error;
    }

    revalidatePath("/admin/kategorie");
    revalidatePath("/produkty");
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error
        ? error.message
        : "Nie udało się zaktualizować kategorii.";
  }

  redirectWithMessage("/admin/kategorie", redirectType, redirectMessage);
}

export async function deleteCategoryAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Kategoria została usunięta.";

  try {
    const { supabase } = await ensureAdmin();
    const categoryId = formData.get("categoryId");

    if (typeof categoryId !== "string" || !categoryId) {
      throw new Error("Brak identyfikatora kategorii.");
    }

    const { error } = await supabase.from("categories").delete().eq("id", categoryId);

    if (error) {
      throw error;
    }

    revalidatePath("/admin/kategorie");
    revalidatePath("/produkty");
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error
        ? error.message
        : "Nie udało się usunąć kategorii.";
  }

  redirectWithMessage("/admin/kategorie", redirectType, redirectMessage);
}

export async function createProductAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Produkt został utworzony.";

  try {
    const { supabase } = await ensureAdmin();

    const parsed = productFormSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      categoryId: formData.get("categoryId"),
      price: formData.get("price"),
      compareAtPrice: formData.get("compareAtPrice") || undefined,
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      format: formData.get("format"),
      pages: formData.get("pages"),
      salesLabel: formData.get("salesLabel"),
      heroNote: formData.get("heroNote"),
      accent: formData.get("accent"),
      coverGradient: formData.get("coverGradient"),
      tags: formData.get("tags"),
      includes: formData.get("includes"),
      bestseller: parseCheckbox(formData.get("bestseller")),
      featured: parseCheckbox(formData.get("featured")),
      isActive: parseCheckbox(formData.get("isActive")),
    });

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Niepoprawne dane produktu.");
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: parsed.data.name,
        slug: parsed.data.slug,
        category_id: parsed.data.categoryId,
        price: parsed.data.price,
        compare_at_price: parsed.data.compareAtPrice ?? null,
        short_description: parsed.data.shortDescription,
        description: parsed.data.description,
        format: parsed.data.format,
        pages: parsed.data.pages,
        sales_label: parsed.data.salesLabel,
        hero_note: parsed.data.heroNote,
        accent: parsed.data.accent,
        cover_gradient: parsed.data.coverGradient,
        tags: parseList(parsed.data.tags),
        includes: parseList(parsed.data.includes),
        bestseller: parsed.data.bestseller ?? false,
        featured: parsed.data.featured ?? false,
        is_active: parsed.data.isActive ?? false,
      })
      .select("id, slug")
      .single();

    if (error || !product) {
      throw error ?? new Error("Nie udało się utworzyć produktu.");
    }

    const coverFile = formData.get("coverFile");
    const productFile = formData.get("productFile");

    const assets = await uploadProductAssets({
      productId: product.id,
      slug: product.slug,
      coverFile: coverFile instanceof File ? coverFile : null,
      productFile: productFile instanceof File ? productFile : null,
    });

    const { error: updateError } = await supabase
      .from("products")
      .update({
        cover_path: assets.coverPath,
        file_path: assets.filePath,
      })
      .eq("id", product.id);

    if (updateError) {
      throw updateError;
    }

    revalidatePath("/admin/produkty");
    revalidatePath("/produkty");
    revalidatePath(`/produkty/${product.slug}`);
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error
        ? error.message
        : "Nie udało się utworzyć produktu.";
  }

  redirectWithMessage("/admin/produkty", redirectType, redirectMessage);
}

export async function updateProductAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Produkt został zaktualizowany.";

  try {
    const { supabase } = await ensureAdmin();

    const parsed = productFormSchema.safeParse({
      productId: formData.get("productId"),
      name: formData.get("name"),
      slug: formData.get("slug"),
      categoryId: formData.get("categoryId"),
      price: formData.get("price"),
      compareAtPrice: formData.get("compareAtPrice") || undefined,
      shortDescription: formData.get("shortDescription"),
      description: formData.get("description"),
      format: formData.get("format"),
      pages: formData.get("pages"),
      salesLabel: formData.get("salesLabel"),
      heroNote: formData.get("heroNote"),
      accent: formData.get("accent"),
      coverGradient: formData.get("coverGradient"),
      tags: formData.get("tags"),
      includes: formData.get("includes"),
      bestseller: parseCheckbox(formData.get("bestseller")),
      featured: parseCheckbox(formData.get("featured")),
      isActive: parseCheckbox(formData.get("isActive")),
    });

    if (!parsed.success || !parsed.data.productId) {
      throw new Error(parsed.error?.issues[0]?.message ?? "Niepoprawne dane produktu.");
    }

    const { data: existingProduct, error: existingError } = await supabase
      .from("products")
      .select("id, slug, cover_path, file_path")
      .eq("id", parsed.data.productId)
      .maybeSingle();

    if (existingError || !existingProduct) {
      throw existingError ?? new Error("Nie znaleziono produktu.");
    }

    const coverFile = formData.get("coverFile");
    const productFile = formData.get("productFile");
    const assets = await uploadProductAssets({
      productId: existingProduct.id,
      slug: parsed.data.slug,
      coverFile: coverFile instanceof File ? coverFile : null,
      productFile: productFile instanceof File ? productFile : null,
      previousCoverPath: existingProduct.cover_path,
      previousFilePath: existingProduct.file_path,
    });

    const { error } = await supabase
      .from("products")
      .update({
        name: parsed.data.name,
        slug: parsed.data.slug,
        category_id: parsed.data.categoryId,
        price: parsed.data.price,
        compare_at_price: parsed.data.compareAtPrice ?? null,
        short_description: parsed.data.shortDescription,
        description: parsed.data.description,
        format: parsed.data.format,
        pages: parsed.data.pages,
        sales_label: parsed.data.salesLabel,
        hero_note: parsed.data.heroNote,
        accent: parsed.data.accent,
        cover_gradient: parsed.data.coverGradient,
        tags: parseList(parsed.data.tags),
        includes: parseList(parsed.data.includes),
        bestseller: parsed.data.bestseller ?? false,
        featured: parsed.data.featured ?? false,
        is_active: parsed.data.isActive ?? false,
        cover_path: assets.coverPath,
        file_path: assets.filePath,
      })
      .eq("id", parsed.data.productId);

    if (error) {
      throw error;
    }

    revalidatePath("/admin/produkty");
    revalidatePath("/produkty");
    revalidatePath(`/produkty/${existingProduct.slug}`);
    revalidatePath(`/produkty/${parsed.data.slug}`);
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error
        ? error.message
        : "Nie udało się zaktualizować produktu.";
  }

  redirectWithMessage("/admin/produkty", redirectType, redirectMessage);
}

export async function deleteProductAction(formData: FormData) {
  let redirectType: "success" | "error" = "success";
  let redirectMessage = "Produkt został usunięty.";

  try {
    const { supabase } = await ensureAdmin();
    const productId = formData.get("productId");

    if (typeof productId !== "string" || !productId) {
      throw new Error("Brak identyfikatora produktu.");
    }

    const { data: existingProduct, error: existingError } = await supabase
      .from("products")
      .select("slug, cover_path, file_path")
      .eq("id", productId)
      .maybeSingle();

    if (existingError || !existingProduct) {
      throw existingError ?? new Error("Nie znaleziono produktu.");
    }

    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      throw error;
    }

    await Promise.all([
      removeStorageFile(PRODUCT_COVERS_BUCKET, existingProduct.cover_path),
      removeStorageFile(PRODUCT_FILES_BUCKET, existingProduct.file_path),
    ]);

    revalidatePath("/admin/produkty");
    revalidatePath("/produkty");
    revalidatePath(`/produkty/${existingProduct.slug}`);
  } catch (error) {
    redirectType = "error";
    redirectMessage =
      error instanceof Error
        ? error.message
        : "Nie udało się usunąć produktu.";
  }

  redirectWithMessage("/admin/produkty", redirectType, redirectMessage);
}

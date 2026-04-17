import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const PRODUCT_FILES_BUCKET = "product-files";
export const PRODUCT_COVERS_BUCKET = "product-covers";

export async function createProductFileSignedUrl(
  filePath: string,
  expiresIn = 60,
) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !filePath) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(PRODUCT_FILES_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function createProductCoverSignedUrl(
  coverPath: string,
  expiresIn = 3600,
) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !coverPath) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(PRODUCT_COVERS_BUCKET)
    .createSignedUrl(coverPath, expiresIn);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function uploadStorageFile(
  bucket: typeof PRODUCT_FILES_BUCKET | typeof PRODUCT_COVERS_BUCKET,
  path: string,
  file: File,
) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return { data: null, error: new Error("Brak konfiguracji Supabase.") };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const { data, error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: file.type || undefined,
    upsert: true,
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function removeStorageFile(
  bucket: typeof PRODUCT_FILES_BUCKET | typeof PRODUCT_COVERS_BUCKET,
  path?: string | null,
) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !path) {
    return;
  }

  await supabase.storage.from(bucket).remove([path]);
}

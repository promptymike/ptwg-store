import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

const PRODUCT_FILES_BUCKET = "product-files";
const PRODUCT_COVERS_BUCKET = "product-covers";

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

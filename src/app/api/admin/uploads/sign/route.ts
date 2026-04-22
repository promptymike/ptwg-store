import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/session";
import {
  PRODUCT_COVERS_BUCKET,
  PRODUCT_FILES_BUCKET,
  type UploadKind,
  validateUploadMetadata,
} from "@/lib/upload-config";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const signUploadSchema = z.object({
  kind: z.enum(["cover", "preview", "product"]),
  fileName: z.string().min(1, "Brak nazwy pliku."),
  fileSize: z.number().positive("Plik jest pusty."),
  contentType: z.string().optional(),
  productId: z.string().uuid().optional(),
  slug: z.string().min(1).optional(),
});

function slugifyFilename(filename: string) {
  const normalized = filename
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "plik";
}

function slugifySegment(value?: string) {
  if (!value) {
    return "produkt";
  }

  const normalized = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "produkt";
}

function getBucketForKind(kind: UploadKind) {
  return kind === "product" ? PRODUCT_FILES_BUCKET : PRODUCT_COVERS_BUCKET;
}

function getFolderForKind(kind: UploadKind) {
  if (kind === "cover") {
    return "covers";
  }

  if (kind === "preview") {
    return "previews";
  }

  return "files";
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Brak uprawnien administratora." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = signUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Niepoprawne dane uploadu." },
        { status: 400 },
      );
    }

    const validationError = validateUploadMetadata(parsed.data.kind, {
      name: parsed.data.fileName,
      size: parsed.data.fileSize,
      type: parsed.data.contentType,
    });

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Brak konfiguracji Supabase." },
        { status: 500 },
      );
    }

    const productScope = parsed.data.productId
      ? `products/${parsed.data.productId}`
      : `products/drafts/${slugifySegment(parsed.data.slug)}-${crypto.randomUUID()}`;
    const path = `${productScope}/${getFolderForKind(parsed.data.kind)}/${Date.now()}-${slugifyFilename(parsed.data.fileName)}`;
    const bucket = getBucketForKind(parsed.data.kind);
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path, {
        upsert: true,
      });

    if (error || !data?.token) {
      console.error("[admin-upload:sign]", {
        message: error?.message ?? "Brak tokenu signed upload.",
        kind: parsed.data.kind,
        path,
      });

      return NextResponse.json(
        { error: "Nie udalo sie przygotowac uploadu do storage." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      bucket,
      path,
      token: data.token,
    });
  } catch (error) {
    console.error("[admin-upload:sign]", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Nie udalo sie przygotowac uploadu pliku." },
      { status: 500 },
    );
  }
}

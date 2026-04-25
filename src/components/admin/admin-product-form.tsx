"use client";

import {
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  PRODUCT_COVERS_BUCKET,
  PRODUCT_FILES_BUCKET,
  getUploadLimitMb,
  type UploadKind,
} from "@/lib/upload-config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AdminProductFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
};

type SignedUploadPayload = {
  bucket: typeof PRODUCT_COVERS_BUCKET | typeof PRODUCT_FILES_BUCKET;
  path: string;
  token: string;
};

async function requestSignedUpload(input: {
  kind: UploadKind;
  file: File;
  productId?: string;
  slug?: string;
}) {
  const response = await fetch("/api/admin/uploads/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind: input.kind,
      fileName: input.file.name,
      fileSize: input.file.size,
      contentType: input.file.type,
      productId: input.productId,
      slug: input.slug,
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | SignedUploadPayload
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "Nie udało się przygotować uploadu.",
    );
  }

  if (!payload || !("bucket" in payload) || !payload.token || !payload.path) {
    throw new Error("Serwer zwrócił niepoprawną odpowiedź uploadu.");
  }

  return payload;
}

function setHiddenValue(
  form: HTMLFormElement,
  name: string,
  value: string,
) {
  const existing = form.querySelector(
    `input[type="hidden"][name="${name}"]`,
  ) as HTMLInputElement | null;

  if (existing) {
    existing.value = value;
    return;
  }

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = name;
  input.value = value;
  form.append(input);
}

function clearHiddenValue(form: HTMLFormElement, name: string) {
  const existing = form.querySelector(
    `input[type="hidden"][name="${name}"]`,
  ) as HTMLInputElement | null;

  if (existing) {
    existing.remove();
  }
}

function clearFileInput(form: HTMLFormElement, name: string) {
  const input = form.querySelector(
    `input[type="file"][name="${name}"]`,
  ) as HTMLInputElement | null;

  if (input) {
    input.value = "";
  }
}

export function AdminProductForm({
  action,
  children,
  className,
}: AdminProductFormProps) {
  const isPreparedSubmitRef = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (isPreparedSubmitRef.current) {
      isPreparedSubmitRef.current = false;
      return;
    }

    const form = event.currentTarget;
    const coverFile = form.elements.namedItem("coverFile");
    const productFile = form.elements.namedItem("productFile");
    const previewFiles = form.elements.namedItem("previewFiles");
    const hasFileInputs =
      (coverFile instanceof HTMLInputElement && coverFile.files?.length) ||
      (productFile instanceof HTMLInputElement && productFile.files?.length) ||
      (previewFiles instanceof HTMLInputElement && previewFiles.files?.length);

    if (!hasFileInputs) {
      setUploadError(null);
      return;
    }

    event.preventDefault();
    setIsUploading(true);
    setUploadError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error("Brak konfiguracji Supabase w przegladarce.");
      }

      const formData = new FormData(form);
      const productId = formData.get("productId");
      const slug = formData.get("slug");
      const normalizedProductId =
        typeof productId === "string" && productId.length > 0 ? productId : undefined;
      const normalizedSlug =
        typeof slug === "string" && slug.trim().length > 0 ? slug.trim() : undefined;

      const uploadedPreviewPaths: string[] = [];
      const coverCandidate = formData.get("coverFile");
      const productCandidate = formData.get("productFile");
      const previewCandidates = formData.getAll("previewFiles");

      clearHiddenValue(form, "uploadedCoverPath");
      clearHiddenValue(form, "uploadedProductFilePath");
      clearHiddenValue(form, "uploadedPreviewPaths");

      if (coverCandidate instanceof File && coverCandidate.size > 0) {
        const signedUpload = await requestSignedUpload({
          kind: "cover",
          file: coverCandidate,
          productId: normalizedProductId,
          slug: normalizedSlug,
        });
        const { error } = await supabase.storage
          .from(signedUpload.bucket)
          .uploadToSignedUrl(signedUpload.path, signedUpload.token, coverCandidate, {
            upsert: true,
            contentType: coverCandidate.type || undefined,
          });

        if (error) {
          throw new Error(`Nie udalo sie wgrac okladki: ${error.message}`);
        }

        setHiddenValue(form, "uploadedCoverPath", signedUpload.path);
        clearFileInput(form, "coverFile");
      }

      if (productCandidate instanceof File && productCandidate.size > 0) {
        const signedUpload = await requestSignedUpload({
          kind: "product",
          file: productCandidate,
          productId: normalizedProductId,
          slug: normalizedSlug,
        });
        const { error } = await supabase.storage
          .from(signedUpload.bucket)
          .uploadToSignedUrl(
            signedUpload.path,
            signedUpload.token,
            productCandidate,
            {
              upsert: true,
              contentType: productCandidate.type || undefined,
            },
          );

        if (error) {
          throw new Error(`Nie udalo sie wgrac pliku produktu: ${error.message}`);
        }

        setHiddenValue(form, "uploadedProductFilePath", signedUpload.path);
        clearFileInput(form, "productFile");
      }

      for (const previewCandidate of previewCandidates) {
        if (!(previewCandidate instanceof File) || previewCandidate.size <= 0) {
          continue;
        }

        const signedUpload = await requestSignedUpload({
          kind: "preview",
          file: previewCandidate,
          productId: normalizedProductId,
          slug: normalizedSlug,
        });
        const { error } = await supabase.storage
          .from(signedUpload.bucket)
          .uploadToSignedUrl(
            signedUpload.path,
            signedUpload.token,
            previewCandidate,
            {
              upsert: true,
              contentType: previewCandidate.type || undefined,
            },
          );

        if (error) {
          throw new Error(`Nie udalo sie wgrac preview: ${error.message}`);
        }

        uploadedPreviewPaths.push(signedUpload.path);
      }

      if (uploadedPreviewPaths.length > 0) {
        setHiddenValue(
          form,
          "uploadedPreviewPaths",
          JSON.stringify(uploadedPreviewPaths),
        );
        clearFileInput(form, "previewFiles");
      }

      isPreparedSubmitRef.current = true;
      setIsUploading(false);

      const submitter = event.nativeEvent instanceof SubmitEvent
        ? event.nativeEvent.submitter
        : null;

      if (submitter instanceof HTMLElement) {
        form.requestSubmit(submitter);
      } else {
        form.requestSubmit();
      }
    } catch (error) {
      setIsUploading(false);
      setUploadError(
        error instanceof Error
          ? error.message
          : `Nie udalo sie wgrac plikow. Cover do ${getUploadLimitMb(
              "cover",
            )} MB, preview do ${getUploadLimitMb("preview")} MB, plik produktu do ${getUploadLimitMb("product")} MB.`,
      );
    }
  }

  return (
    <form
      action={action}
      className={className}
      onSubmit={handleSubmit}
    >
      <fieldset
        aria-busy={isUploading}
        className={`space-y-4 ${isUploading ? "opacity-80" : ""}`}
      >
        {children}
      </fieldset>

      {uploadError ? (
        <p className="mt-3 rounded-[1.1rem] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {uploadError}
        </p>
      ) : null}

      {isUploading ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Uploadujemy pliki do storage. Nie zamykaj tego widoku.
        </p>
      ) : null}
    </form>
  );
}

import type { Metadata } from "next";

import { env } from "@/lib/env";

export function getCanonicalUrl(path: string) {
  return new URL(path, env.siteUrl).toString();
}

export function buildCanonicalMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const canonical = getCanonicalUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Templify",
      type: "website",
      images: image
        ? [
            {
              url: image,
            },
          ]
        : undefined,
    },
  };
}

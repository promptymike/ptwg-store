import { ImageResponse } from "next/og";

import { getCoverArt } from "@/lib/product-cover-art";
import { getStoreProductBySlug } from "@/lib/supabase/store";

export const runtime = "nodejs";

const SIZE = { width: 800, height: 1000 } as const;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug).catch(() => null);

  const art = getCoverArt(product?.category);
  const category = product?.category ?? "Templify";
  const format = product?.format ?? "Ebook";

  // Cover is decoration-only: gradient + themed emoji + soft shape +
  // category/format badges + Templify mark. The product NAME is rendered by
  // the card's <h3> / hero's <h1> on top of this image — putting it here too
  // would just produce two stacked titles in different fonts. The middle of
  // the canvas is intentionally empty so the storefront title can breathe.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 56,
          position: "relative",
          background: `linear-gradient(135deg, ${art.from} 0%, ${art.to} 100%)`,
          color: art.text,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -60,
            fontSize: 520,
            lineHeight: 1,
            opacity: 0.18,
            display: "flex",
          }}
        >
          {art.icon}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -120,
            width: 380,
            height: 380,
            borderRadius: 9999,
            background: art.shape,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 2,
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.85)",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: 9999,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {category}
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              color: art.text,
              padding: "10px 18px",
              borderRadius: 9999,
              fontSize: 15,
              fontWeight: 700,
              display: "flex",
            }}
          >
            {format}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 9999,
                background: art.accent,
                color: "#fff",
                fontSize: 22,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              T
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: art.text,
                display: "flex",
              }}
            >
              Templify
            </div>
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: art.textSecondary,
              display: "flex",
            }}
          >
            Praktyczny przewodnik
          </div>
        </div>
      </div>
    ),
    {
      ...SIZE,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}

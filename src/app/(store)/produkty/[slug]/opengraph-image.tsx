import { ImageResponse } from "next/og";

import { formatCurrency } from "@/lib/format";
import { getStoreProductBySlug } from "@/lib/supabase/store";

export const runtime = "nodejs";

export const alt = "Templify — karta produktu";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

type Props = {
  params: { slug: string };
};

const FALLBACK_GRADIENT =
  "linear-gradient(135deg, #1a1612 0%, #2a221b 50%, #3a2c1f 100%)";

// Tailwind cover gradients in the catalog map to from-X-Y / to-A-B utility
// classes. For the OG image we approximate with hand-picked palettes so the
// PNG looks consistent without depending on Tailwind at runtime.
const PALETTES: Array<[string, string]> = [
  ["#fde68a", "#f59e0b"],
  ["#fbcfe8", "#db2777"],
  ["#bbf7d0", "#16a34a"],
  ["#bfdbfe", "#2563eb"],
  ["#ddd6fe", "#7c3aed"],
  ["#fed7aa", "#ea580c"],
  ["#a7f3d0", "#059669"],
  ["#fecaca", "#dc2626"],
];

function gradientForSlug(slug: string) {
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const [from, to] = PALETTES[hash % PALETTES.length] ?? PALETTES[0];
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

export default async function Image({ params }: Props) {
  const { slug } = params;
  const product = await getStoreProductBySlug(slug).catch(() => null);

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: FALLBACK_GRADIENT,
            color: "#f5f1ea",
            fontSize: 56,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Templify
        </div>
      ),
      size,
    );
  }

  const cover = gradientForSlug(product.slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#1a1612",
          color: "#f5f1ea",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            width: 480,
            background: cover,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 48,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: 5,
              textTransform: "uppercase",
              color: "rgba(26, 22, 18, 0.85)",
              fontWeight: 600,
            }}
          >
            {product.category}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#1a1612",
              letterSpacing: -1,
              textShadow: "0 1px 0 rgba(255,255,255,0.4)",
            }}
          >
            {product.name}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "#e2bc72",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
                color: "#1a1612",
              }}
            >
              T
            </div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>Templify</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                fontSize: 22,
                lineHeight: 1.4,
                color: "rgba(245, 241, 234, 0.78)",
                maxWidth: 540,
              }}
            >
              {product.shortDescription}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: "#e2bc72",
                  letterSpacing: -1,
                }}
              >
                {formatCurrency(product.price)}
              </div>
              {product.compareAtPrice &&
              product.compareAtPrice > product.price ? (
                <div
                  style={{
                    fontSize: 24,
                    color: "rgba(245, 241, 234, 0.5)",
                    textDecoration: "line-through",
                  }}
                >
                  {formatCurrency(product.compareAtPrice)}
                </div>
              ) : null}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              fontSize: 16,
              color: "rgba(245, 241, 234, 0.65)",
            }}
          >
            <span style={{ display: "flex" }}>{product.format}</span>
            <span style={{ display: "flex" }}>·</span>
            <span style={{ display: "flex" }}>natychmiastowy dostęp</span>
            <span style={{ display: "flex" }}>·</span>
            <span style={{ display: "flex" }}>14 dni na zwrot</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

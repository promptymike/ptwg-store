import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Templify — praktyczne ebooki i planery dla codziennego życia";
export const size = { width: 1200, height: 630 } as const;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background:
            "linear-gradient(135deg, #1a1612 0%, #2a221b 50%, #3a2c1f 100%)",
          color: "#f5f1ea",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#e2bc72",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
              color: "#1a1612",
            }}
          >
            T
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: -0.5,
            }}
          >
            Templify
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 18,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "rgba(245, 241, 234, 0.6)",
            }}
          >
            ebooki i planery
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 920,
            }}
          >
            Praktyczne przewodniki dla codziennego życia.
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "rgba(245, 241, 234, 0.75)",
              maxWidth: 880,
            }}
          >
            Finanse, zdrowie, macierzyństwo, produktywność, kariera — bez
            teorii, bez ściemy.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            color: "rgba(245, 241, 234, 0.7)",
          }}
        >
          <div
            style={{
              padding: "10px 20px",
              borderRadius: 999,
              border: "1px solid rgba(226, 188, 114, 0.4)",
              background: "rgba(226, 188, 114, 0.12)",
              color: "#e2bc72",
              fontWeight: 600,
            }}
          >
            templify.pl
          </div>
          <div style={{ display: "flex" }}>·</div>
          <div style={{ display: "flex" }}>14 dni na zwrot</div>
          <div style={{ display: "flex" }}>·</div>
          <div style={{ display: "flex" }}>natychmiastowy dostęp</div>
        </div>
      </div>
    ),
    size,
  );
}

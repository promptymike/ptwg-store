import { ImageResponse } from "next/og";

import { getInteractivePlanner } from "@/data/interactive-planners";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const planner = getInteractivePlanner(slug);
  if (!planner) return new Response("Nie znaleziono planera.", { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 58,
          gap: 48,
          background: "linear-gradient(135deg,#11100d,#2b241b)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ width: "54%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", color: "#e8c477", fontSize: 18, textTransform: "uppercase", letterSpacing: 4 }}>
            Interaktywny planer online
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 68, lineHeight: 1, fontWeight: 800, letterSpacing: -2 }}>
            {planner.name}
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 26, lineHeight: 1.35, color: "rgba(255,255,255,.72)" }}>
            {planner.tagline}
          </div>
          <div style={{ display: "flex", marginTop: 38, fontSize: 22, color: "#e8c477" }}>templify.pl</div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 430, height: 500, borderRadius: 36, background: "#faf7f1", padding: 28, color: "#17130f", display: "flex", flexDirection: "column", boxShadow: "0 34px 70px rgba(0,0,0,.35)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #ded8cf", paddingBottom: 18 }}>
              <div style={{ display: "flex", fontWeight: 800 }}>{planner.shortName}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2].map((dot) => (
                  <div
                    key={dot}
                    style={{
                      display: "flex",
                      width: 7,
                      height: 7,
                      borderRadius: 99,
                      background: "#9b7a3d",
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
              <div style={{ width: "58%", display: "flex", flexDirection: "column", gap: 14 }}>
                {planner.features.slice(0, 4).map((feature, index) => (
                  <div key={feature} style={{ display: "flex", gap: 10, alignItems: "center", padding: 14, borderRadius: 14, background: index === 0 ? "#ead39c" : "#eee9e1", fontSize: 16 }}>
                    <span
                      style={{
                        display: "flex",
                        width: 10,
                        height: 6,
                        borderLeft: "2px solid #17130f",
                        borderBottom: "2px solid #17130f",
                        transform: "rotate(-45deg)",
                        marginTop: -2,
                      }}
                    />
                    {feature}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", borderRadius: 20, background: "#181511", color: "#fff", padding: 20 }}>
                <div style={{ display: "flex", fontSize: 14, color: "rgba(255,255,255,.55)", textTransform: "uppercase" }}>{planner.previewStat.label}</div>
                <div style={{ display: "flex", fontSize: 50, fontWeight: 800 }}>{planner.previewStat.value}</div>
                <div style={{ height: 10, borderRadius: 99, background: "#e8c477", display: "flex" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000" },
    },
  );
}

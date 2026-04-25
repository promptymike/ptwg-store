import { ImageResponse } from "next/og";

export const runtime = "nodejs";

// Stable URL the manifest can reference without Next.js's hashed icon
// route changing across deploys. Both icon variants live here so we can
// pass `?maskable=1` for the safe-zone-padded version Android home
// screens expect.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const maskable = url.searchParams.get("maskable") === "1";
  const size = 512;
  const pad = maskable ? 80 : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #1a1612 0%, #2a221b 60%, #3a2c1f 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: pad,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#e2bc72",
            fontFamily: "Georgia, serif",
            fontSize: maskable ? 240 : 320,
            fontWeight: 700,
            letterSpacing: -8,
          }}
        >
          T
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}

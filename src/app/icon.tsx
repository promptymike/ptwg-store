import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 512, height: 512 } as const;
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #1a1612 0%, #2a221b 60%, #3a2c1f 100%)",
          color: "#e2bc72",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          fontSize: 320,
          fontWeight: 700,
          letterSpacing: -10,
        }}
      >
        T
      </div>
    ),
    size,
  );
}

import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { getInteractivePlanner } from "@/data/interactive-planners";
import { verifyPlannerEmbedAccessToken } from "@/lib/planners/embed-access";
import { localizePlannerAssets } from "@/lib/planners/assets";
import { renderPlannerBridge } from "@/lib/planners/bridge";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const planner = getInteractivePlanner(slug);
  if (!planner) return new NextResponse("Nie znaleziono planera.", { status: 404 });

  const mode = new URL(request.url).searchParams.get("mode") === "owned" ? "owned" : "demo";
  if (mode === "owned") {
    const accessToken = new URL(request.url).searchParams.get("access");
    if (!verifyPlannerEmbedAccessToken(accessToken, planner.slug)) {
      return new NextResponse("Sesja planera wygasła. Otwórz planer ponownie z biblioteki.", {
        status: 401,
      });
    }
  }

  const filePath = path.join(process.cwd(), "templates", "interactive-planners", planner.sourceFile);
  const source = await readFile(filePath, "utf8").catch(() => null);
  if (!source) return new NextResponse("Brakuje pliku planera.", { status: 404 });

  const bridge = renderPlannerBridge(planner.slug, mode);
  const html = localizePlannerAssets(source).replace(/<head(\s[^>]*)?>/i, (match) => `${match}${bridge}`);
  const appOrigin = new URL(request.url).origin;
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": [
        "default-src 'none'",
        `script-src 'unsafe-inline' ${appOrigin}`,
        `style-src 'unsafe-inline' ${appOrigin} https://fonts.googleapis.com`,
        "font-src https://fonts.gstatic.com data:",
        `img-src ${appOrigin} data: blob: https://*.basemaps.cartocdn.com`,
        `connect-src ${appOrigin} https://api.open-meteo.com https://geocoding-api.open-meteo.com`,
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
        "frame-ancestors 'self'",
      ].join("; "),
      "Referrer-Policy": "same-origin",
    },
  });
}

import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";

import { resolvePlannerAsset, wrapPlannerAssetSource } from "@/lib/planners/assets";

export async function GET(_request: Request, { params }: { params: Promise<{ asset: string[] }> }) {
  const { asset } = await params;
  const assetPath = asset.join("/");
  const resolved = resolvePlannerAsset(assetPath);

  if (!resolved) {
    return new NextResponse("Planner asset not found.", { status: 404 });
  }

  const isTextAsset = resolved.contentType.startsWith("text/");
  const body = await readFile(resolved.filePath, isTextAsset ? "utf8" : undefined).catch(() => null);

  if (!body) {
    return new NextResponse("Planner asset file is missing.", { status: 404 });
  }

  const responseBody = typeof body === "string" ? wrapPlannerAssetSource(body, resolved.wrapper) : body;

  return new NextResponse(responseBody, {
    headers: {
      "Content-Type": resolved.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

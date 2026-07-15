import { NextResponse } from "next/server";

import { consumeRateLimit, getClientAddress } from "@/lib/rate-limit";
import { findSearchResults } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const rateLimit = consumeRateLimit(
    "search",
    getClientAddress(request.headers),
    { limit: 60, windowMs: 60_000 },
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { products: [], blog: [], code: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const results = await findSearchResults(query, {
    productLimit: 8,
    blogLimit: 6,
  });

  return NextResponse.json(results);
}

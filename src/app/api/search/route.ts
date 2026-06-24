import { NextResponse } from "next/server";

import { findSearchResults } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  const results = await findSearchResults(query, {
    productLimit: 8,
    blogLimit: 6,
  });

  return NextResponse.json(results);
}

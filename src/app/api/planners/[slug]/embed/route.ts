import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { getInteractivePlanner } from "@/data/interactive-planners";
import { renderPlannerBridge } from "@/lib/planners/bridge";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const planner = getInteractivePlanner(slug);
  if (!planner) return new NextResponse("Nie znaleziono planera.", { status: 404 });

  const mode = new URL(request.url).searchParams.get("mode") === "owned" ? "owned" : "demo";
  if (mode === "owned") {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (!supabase || !auth.user) return new NextResponse("Zaloguj się, aby otworzyć planer.", { status: 401 });
    const { data: access } = await supabase.from("library_items").select("id").eq("user_id", auth.user.id).eq("product_id", planner.id).maybeSingle();
    if (!access) return new NextResponse("Ten planer nie jest jeszcze w Twojej bibliotece.", { status: 403 });
  }

  const filePath = path.join(process.cwd(), "templates", "interactive-planners", planner.sourceFile);
  const source = await readFile(filePath, "utf8").catch(() => null);
  if (!source) return new NextResponse("Brakuje pliku planera.", { status: 404 });

  const bridge = renderPlannerBridge(planner.slug, mode);
  const html = source.replace(/<head(\s[^>]*)?>/i, (match) => `${match}${bridge}`);
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "frame-ancestors 'self'",
      "Referrer-Policy": "same-origin",
    },
  });
}

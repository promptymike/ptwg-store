import { NextResponse } from "next/server";

import { getCurrentProfile, getCurrentUser } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const categories = new Set(["bug", "idea", "ux", "content"]);

export async function POST(request: Request) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user || !profile?.is_tester) {
    return NextResponse.json({ error: "Brak dostępu testera." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    category?: string;
    message?: string;
    pageUrl?: string;
    screenshot?: string | null;
    viewport?: string;
  } | null;
  const message = body?.message?.trim() ?? "";
  const category = categories.has(body?.category ?? "") ? body!.category! : "bug";
  if (message.length < 3 || message.length > 4000 || !body?.pageUrl?.startsWith("http")) {
    return NextResponse.json({ error: "Nieprawidłowe zgłoszenie." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Brak konfiguracji." }, { status: 503 });

  let screenshotPath: string | null = null;
  if (body.screenshot?.startsWith("data:image/")) {
    const match = body.screenshot.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
    if (match) {
      const bytes = Buffer.from(match[2], "base64");
      if (bytes.byteLength <= 5 * 1024 * 1024) {
        const extension = match[1] === "image/png" ? "png" : match[1] === "image/webp" ? "webp" : "jpg";
        screenshotPath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const { error } = await admin.storage.from("tester-feedback").upload(screenshotPath, bytes, { contentType: match[1], upsert: false });
        if (error) screenshotPath = null;
      }
    }
  }

  const { error } = await admin.from("tester_feedback").insert({
    user_id: user.id,
    category,
    message,
    page_url: body.pageUrl.slice(0, 2000),
    user_agent: request.headers.get("user-agent")?.slice(0, 1000) ?? null,
    viewport: body.viewport?.slice(0, 50) ?? null,
    screenshot_path: screenshotPath,
  });
  if (error) return NextResponse.json({ error: "Nie udało się zapisać." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

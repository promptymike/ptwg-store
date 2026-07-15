import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentProfile, getCurrentUser } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const MAX_REQUEST_BYTES = 4_250_000;
const MAX_SCREENSHOT_BYTES = 3 * 1024 * 1024;

const feedbackSchema = z.object({
  category: z.enum(["bug", "idea", "ux", "content"]).default("bug"),
  message: z.string().trim().min(3).max(4000),
  pageUrl: z.string().url().max(2000).refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }),
  screenshot: z.string().max(4_200_000).nullable().optional(),
  viewport: z.string().max(50).optional(),
});

export async function POST(request: Request) {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  if (!user || !profile?.is_tester) {
    return NextResponse.json({ error: "Brak dostępu testera." }, { status: 403 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: "Zgłoszenie jest zbyt duże." }, { status: 413 });
  }

  const parsed = feedbackSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Nieprawidłowe zgłoszenie." }, { status: 400 });
  }
  const body = parsed.data;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Brak konfiguracji." }, { status: 503 });

  let screenshotPath: string | null = null;
  if (body.screenshot?.startsWith("data:image/")) {
    const match = body.screenshot.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
    if (match) {
      const bytes = Buffer.from(match[2], "base64");
      if (bytes.byteLength <= MAX_SCREENSHOT_BYTES) {
        const extension = match[1] === "image/png" ? "png" : match[1] === "image/webp" ? "webp" : "jpg";
        screenshotPath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const { error } = await admin.storage.from("tester-feedback").upload(screenshotPath, bytes, { contentType: match[1], upsert: false });
        if (error) screenshotPath = null;
      }
    }
  }

  const { error } = await admin.from("tester_feedback").insert({
    user_id: user.id,
    category: body.category,
    message: body.message,
    page_url: body.pageUrl,
    user_agent: request.headers.get("user-agent")?.slice(0, 1000) ?? null,
    viewport: body.viewport?.slice(0, 50) ?? null,
    screenshot_path: screenshotPath,
  });
  if (error) return NextResponse.json({ error: "Nie udało się zapisać." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

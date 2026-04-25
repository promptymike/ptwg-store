"use server";

import { z } from "zod";

import { sendPushToAll } from "@/lib/push";
import { getCurrentUser } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const broadcastSchema = z.object({
  title: z.string().trim().min(2).max(80),
  body: z.string().trim().min(2).max(240),
  url: z
    .string()
    .trim()
    .startsWith("/", "Podaj ścieżkę zaczynającą się od /")
    .max(500)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
});

export type BroadcastState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      message: string;
      attempted: number;
      delivered: number;
      removedExpired: number;
    };

async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Brak autoryzacji");
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Brak Supabase");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Brak uprawnień admina");
}

export async function broadcastPushAction(
  _prev: BroadcastState,
  formData: FormData,
): Promise<BroadcastState> {
  try {
    await ensureAdmin();
  } catch (err) {
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : "Wymagane uprawnienia admina.",
    };
  }

  const parsed = broadcastSchema.safeParse({
    title: formData.get("title") ?? "",
    body: formData.get("body") ?? "",
    url: formData.get("url") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ??
        "Sprawdź tytuł i treść powiadomienia.",
    };
  }

  const result = await sendPushToAll({
    title: parsed.data.title,
    body: parsed.data.body,
    url: parsed.data.url,
    tag: "templify-broadcast",
  });

  return {
    status: "ok",
    message: `Wysłano do ${result.delivered} z ${result.attempted} subskrybentów. Wygasłych usunięto: ${result.removedExpired}.`,
    ...result,
  };
}

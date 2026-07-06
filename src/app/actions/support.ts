"use server";

import { z } from "zod";

import { sendEmail } from "@/lib/email/client";
import {
  renderSupportAckEmail,
  renderSupportNotificationEmail,
  SUPPORT_TOPICS,
} from "@/lib/email/support-templates";
import { getCurrentUser } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSiteSettingsSnapshot } from "@/lib/supabase/store";

const supportSchema = z.object({
  name: z.string().trim().min(2, "Podaj imię (min. 2 znaki).").max(120),
  email: z.string().trim().toLowerCase().email("Wpisz poprawny adres e-mail."),
  topic: z
    .enum(SUPPORT_TOPICS.map((topic) => topic.value) as [string, ...string[]])
    .default("pytanie"),
  orderRef: z.string().trim().max(80).optional().default(""),
  message: z
    .string()
    .trim()
    .min(10, "Opisz sprawę w kilku zdaniach (min. 10 znaków).")
    .max(4000, "Wiadomość może mieć maksymalnie 4000 znaków."),
  // Any value in this hidden field means a bot filled the form.
  honeypot: z.string().optional().default(""),
});

export type SupportRequestState =
  | { status: "idle" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

export async function submitSupportRequestAction(
  _prev: SupportRequestState,
  formData: FormData,
): Promise<SupportRequestState> {
  const parsed = supportSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic") ?? "pytanie",
    orderRef: formData.get("orderRef") ?? "",
    message: formData.get("message"),
    honeypot: formData.get("hp") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Sprawdź dane formularza.",
    };
  }

  const okMessage =
    "Dzięki! Twoje zgłoszenie do nas dotarło — odpowiemy najpóźniej następnego dnia roboczego.";

  if (parsed.data.honeypot) {
    // Pretend success so bots don't learn anything.
    return { status: "ok", message: okMessage };
  }

  const { name, email, topic, orderRef, message } = parsed.data;

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      status: "error",
      message:
        "Formularz jest chwilowo niedostępny. Napisz do nas bezpośrednio: ptwgadmin@gmail.com.",
    };
  }

  const user = await getCurrentUser();

  const { error } = await supabase.from("support_requests").insert({
    user_id: user?.id ?? null,
    name,
    email,
    topic,
    order_ref: orderRef || null,
    message,
  });

  if (error) {
    console.error("[support] insert failed", { message: error.message });
    return {
      status: "error",
      message:
        "Nie udało się zapisać zgłoszenia. Spróbuj ponownie albo napisz na ptwgadmin@gmail.com.",
    };
  }

  // Email delivery is best-effort: the request is already persisted, so a
  // Resend outage must not fail the submission.
  const settings = await getSiteSettingsSnapshot();
  const input = { name, email, topic, orderRef, message };
  const notification = renderSupportNotificationEmail(input);
  const ack = renderSupportAckEmail(input);

  await Promise.all([
    sendEmail({
      to: settings.supportEmail,
      subject: notification.subject,
      html: notification.html,
      text: notification.text,
      replyTo: email,
      tags: [{ name: "type", value: "support-notification" }],
    }),
    sendEmail({
      to: email,
      subject: ack.subject,
      html: ack.html,
      text: ack.text,
      tags: [{ name: "type", value: "support-ack" }],
    }),
  ]).catch((error) => {
    console.error("[support] email send failed", {
      message: error instanceof Error ? error.message : String(error),
    });
  });

  return { status: "ok", message: okMessage };
}

"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { sendEmail } from "@/lib/email/client";
import {
  renderSupportAckEmail,
  renderSupportNotificationEmail,
  SUPPORT_TOPICS,
} from "@/lib/email/support-templates";
import { getCurrentUser } from "@/lib/session";
import { buildSupportTrackingUrl } from "@/lib/support/tracking";
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
  | {
      status: "ok";
      message: string;
      ticketNumber?: string;
      trackingUrl?: string;
    }
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
    "Dzięki! Twoje zgłoszenie do nas dotarło — odpowiemy najpóźniej następnego dnia roboczego, a reklamacje rozpatrujemy w ciągu 14 dni.";

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

  const { data: created, error } = await supabase
    .from("support_requests")
    .insert({
      user_id: user?.id ?? null,
      name,
      email,
      topic,
      order_ref: orderRef || null,
      message,
    })
    .select("ticket_number, public_token")
    .single();

  if (error || !created) {
    console.error("[support] insert failed", { message: error?.message });
    return {
      status: "error",
      message:
        "Nie udało się zapisać zgłoszenia. Spróbuj ponownie albo napisz na ptwgadmin@gmail.com.",
    };
  }

  const ticketNumber = created.ticket_number as string;
  const trackingUrl = buildSupportTrackingUrl(created.public_token as string);

  // Email delivery is best-effort: the request is already persisted, so a
  // Resend outage must not fail the submission.
  const settings = await getSiteSettingsSnapshot();
  const input = { name, email, topic, orderRef, message, ticketNumber, trackingUrl };
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

  return { status: "ok", message: okMessage, ticketNumber, trackingUrl };
}

const lookupSchema = z.object({
  ticketNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^TPL-\d{3,}$/, "Numer zgłoszenia ma format TPL-00123."),
  email: z.string().trim().toLowerCase().email("Wpisz poprawny adres e-mail."),
});

export type SupportLookupState =
  | { status: "idle" }
  | { status: "error"; message: string };

// Looks a ticket up by (public number + e-mail) and redirects to its private
// status page. The pair acts as the auth factor for guests; the redirect URL
// only ever contains the opaque token, never the e-mail.
export async function lookupSupportRequestAction(
  _prev: SupportLookupState,
  formData: FormData,
): Promise<SupportLookupState> {
  const parsed = lookupSchema.safeParse({
    ticketNumber: formData.get("ticketNumber"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Sprawdź dane formularza.",
    };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      status: "error",
      message: "Sprawdzanie statusu jest chwilowo niedostępne. Napisz na ptwgadmin@gmail.com.",
    };
  }

  const { data } = await supabase
    .from("support_requests")
    .select("public_token")
    .eq("ticket_number", parsed.data.ticketNumber)
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (!data) {
    return {
      status: "error",
      message:
        "Nie znaleźliśmy zgłoszenia o tym numerze i adresie e-mail. Sprawdź dane z maila potwierdzającego.",
    };
  }

  redirect(`/pomoc/zgloszenie/${data.public_token}`);
}

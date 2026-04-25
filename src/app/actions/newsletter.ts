"use server";

import { z } from "zod";

import { sendEmail } from "@/lib/email/client";
import { renderNewsletterWelcomeEmail } from "@/lib/email/newsletter-templates";
import { env } from "@/lib/env";
import { getCanonicalUrl } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Wpisz poprawny adres e-mail."),
  source: z.string().trim().max(60).optional().default("inline"),
  consent: z.boolean().default(true),
  // First-line spam check: any value here means a bot filled a hidden field.
  honeypot: z.string().optional().default(""),
});

export type SubscribeNewsletterState =
  | { status: "idle" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string };

export async function subscribeToNewsletterAction(
  _prev: SubscribeNewsletterState,
  formData: FormData,
): Promise<SubscribeNewsletterState> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? "inline",
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
    honeypot: formData.get("hp") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Sprawdź dane formularza.",
    };
  }

  if (parsed.data.honeypot) {
    // Pretend success so bots don't learn anything.
    return {
      status: "ok",
      message: "Dzięki! Sprawdź skrzynkę za chwilę.",
    };
  }

  if (!parsed.data.consent) {
    return {
      status: "error",
      message:
        "Potrzebujemy zgody na newsletter (RODO). Zaznacz checkbox i spróbuj ponownie.",
    };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { status: "error", message: "Brak konfiguracji Supabase." };
  }

  const user = await getCurrentUser();

  // Upsert by email so re-submitting an existing address is a no-op rather
  // than a duplicate-key error. unsubscribed_at gets reset so a previously
  // unsubscribed person can opt back in.
  const { error: upsertError } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      {
        email: parsed.data.email,
        source: parsed.data.source,
        consent: true,
        user_id: user?.id ?? null,
        unsubscribed_at: null,
      },
      { onConflict: "email" },
    );

  if (upsertError) {
    return {
      status: "error",
      message: "Nie udało się zapisać. Spróbuj ponownie za chwilę.",
    };
  }

  // Best-effort welcome email — failure here doesn't roll back the
  // subscription. We point the lead magnet at the cheapest published
  // sample so the email always has somewhere interesting to land.
  try {
    const { data: sampleProduct } = await supabase
      .from("products")
      .select("slug, name, file_path")
      .eq("status", "published")
      .not("file_path", "is", null)
      .order("price", { ascending: true })
      .limit(1)
      .maybeSingle();

    const sampleUrl = sampleProduct
      ? getCanonicalUrl(`/api/produkty/${sampleProduct.slug}/probka`)
      : undefined;

    const message = renderNewsletterWelcomeEmail({
      sampleUrl,
      sampleTitle: sampleProduct?.name,
    });
    await sendEmail({
      to: parsed.data.email,
      subject: message.subject,
      html: message.html,
      text: message.text,
      tags: [
        { name: "type", value: "newsletter-welcome" },
        { name: "source", value: parsed.data.source.replace(/[^a-zA-Z0-9_-]/g, "_") },
      ],
    });
  } catch (error) {
    console.warn("[newsletter] welcome send failed", error);
  }

  // Resend Audiences (optional). When NEXT_PUBLIC_RESEND_AUDIENCE_ID is
  // configured the contact is also synced to that audience for broadcasts.
  const audienceId = env.resendAudienceId;
  if (audienceId && env.resendApiKey) {
    try {
      const response = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: parsed.data.email,
            unsubscribed: false,
          }),
        },
      );
      if (response.ok) {
        const json = (await response.json().catch(() => null)) as
          | { id?: string }
          | null;
        if (json?.id) {
          await supabase
            .from("newsletter_subscribers")
            .update({ resend_contact_id: json.id })
            .eq("email", parsed.data.email);
        }
      }
    } catch (error) {
      console.warn("[newsletter] resend audience sync failed", error);
    }
  }

  return {
    status: "ok",
    message: "Zapisaliśmy Cię. Sprawdź skrzynkę — pierwsza wiadomość już leci.",
  };
}

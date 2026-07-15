"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { sendEmail } from "@/lib/email/client";
import {
  renderSupportUpdateEmail,
  SUPPORT_STATUSES,
} from "@/lib/email/support-templates";
import { getCurrentProfile } from "@/lib/session";
import { buildSupportTrackingUrl } from "@/lib/support/tracking";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  requestId: z.string().uuid(),
  newStatus: z.enum(
    SUPPORT_STATUSES.map((status) => status.value) as [string, ...string[]],
  ),
  reply: z.string().trim().max(6000).optional().default(""),
  internalNote: z.string().trim().max(6000).optional().default(""),
});

// Single form action for the admin ticket card: optionally changes status,
// optionally sends a reply (e-mailed + stored on the customer timeline),
// optionally stores an internal note (never shown to the customer).
export async function updateSupportTicketAction(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Brak uprawnień administratora.");
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Brak konfiguracji Supabase.");
  }

  const parsed = updateSchema.safeParse({
    requestId: formData.get("requestId"),
    newStatus: formData.get("newStatus"),
    reply: formData.get("reply") ?? "",
    internalNote: formData.get("internalNote") ?? "",
  });

  if (!parsed.success) {
    throw new Error("Nieprawidłowe dane formularza zgłoszenia.");
  }

  const { requestId, newStatus, reply, internalNote } = parsed.data;

  const { data: request, error: requestError } = await supabase
    .from("support_requests")
    .select("id, status, name, email, ticket_number, public_token")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    throw new Error("Nie znaleziono zgłoszenia.");
  }

  const statusChanged = newStatus !== request.status;
  const now = new Date().toISOString();
  const events: {
    request_id: string;
    author: string;
    kind: string;
    body?: string;
    old_status?: string;
    new_status?: string;
  }[] = [];

  if (statusChanged) {
    const patch: { status: string; updated_at: string; handled_at?: string } = {
      status: newStatus,
      updated_at: now,
    };
    if (newStatus === "resolved" || newStatus === "closed") {
      patch.handled_at = now;
    }

    const { error: updateError } = await supabase
      .from("support_requests")
      .update(patch)
      .eq("id", requestId);

    if (updateError) {
      throw new Error(`Nie udało się zmienić statusu: ${updateError.message}`);
    }

    events.push({
      request_id: requestId,
      author: "admin",
      kind: "status_change",
      old_status: request.status,
      new_status: newStatus,
    });
  }

  if (reply) {
    events.push({
      request_id: requestId,
      author: "admin",
      kind: "message",
      body: reply,
    });
  }

  if (internalNote) {
    events.push({
      request_id: requestId,
      author: "admin",
      kind: "note",
      body: internalNote,
    });
  }

  if (events.length > 0) {
    const { error: eventsError } = await supabase
      .from("support_request_events")
      .insert(events);

    if (eventsError) {
      throw new Error(`Nie udało się zapisać historii: ${eventsError.message}`);
    }

    if (!statusChanged) {
      await supabase
        .from("support_requests")
        .update({ updated_at: now })
        .eq("id", requestId);
    }
  }

  // Customer notification is best-effort: history is already persisted.
  if (reply || statusChanged) {
    const update = renderSupportUpdateEmail({
      name: request.name,
      ticketNumber: request.ticket_number,
      trackingUrl: buildSupportTrackingUrl(request.public_token),
      newStatus: statusChanged ? newStatus : undefined,
      reply: reply || undefined,
    });

    await sendEmail({
      to: request.email,
      subject: update.subject,
      html: update.html,
      text: update.text,
      tags: [{ name: "type", value: "support-update" }],
    }).catch((error) => {
      console.error("[support] update email failed", {
        message: error instanceof Error ? error.message : String(error),
      });
    });
  }

  revalidatePath("/admin/zgloszenia");
}

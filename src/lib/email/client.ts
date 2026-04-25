import "server-only";

import { Resend } from "resend";

import { env } from "@/lib/env";

let cached: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!env.resendApiKey) {
    return null;
  }
  if (!cached) {
    cached = new Resend(env.resendApiKey);
  }
  return cached;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
};

export async function sendEmail(input: SendEmailInput) {
  const client = getResendClient();

  if (!client) {
    console.info("[email] resend disabled — RESEND_API_KEY missing", {
      to: input.to,
      subject: input.subject,
    });
    return { skipped: true as const };
  }

  const result = await client.emails.send({
    from: env.resendFromAddress,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo ?? env.resendReplyTo,
    tags: input.tags,
  });

  if (result.error) {
    console.error("[email] resend send failed", {
      to: input.to,
      subject: input.subject,
      error: result.error.message,
    });
    return { skipped: false as const, error: result.error.message };
  }

  return { skipped: false as const, id: result.data?.id ?? null };
}

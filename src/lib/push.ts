import "server-only";

import webpush from "web-push";

import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  if (!env.vapidPublicKey || !env.vapidPrivateKey) return false;
  webpush.setVapidDetails(
    env.vapidSubject,
    env.vapidPublicKey,
    env.vapidPrivateKey,
  );
  configured = true;
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  /** Optional dedupe tag — overlapping notifications collapse into one. */
  tag?: string;
};

export type SendResult = {
  attempted: number;
  delivered: number;
  removedExpired: number;
};

export async function sendPushToAll(payload: PushPayload): Promise<SendResult> {
  if (!ensureConfigured()) {
    return { attempted: 0, delivered: 0, removedExpired: 0 };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { attempted: 0, delivered: 0, removedExpired: 0 };
  }

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth");

  if (error || !subs || subs.length === 0) {
    return { attempted: 0, delivered: 0, removedExpired: 0 };
  }

  const json = JSON.stringify(payload);
  let delivered = 0;
  const expiredEndpoints: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          json,
        );
        delivered += 1;
      } catch (err: unknown) {
        // 404/410 means the subscription is gone (uninstalled, denied,
        // expired). Reap so the next send doesn't retry forever.
        const status =
          typeof err === "object" && err !== null && "statusCode" in err
            ? Number((err as { statusCode: number }).statusCode)
            : 0;
        if (status === 404 || status === 410) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    }),
  );

  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }

  return {
    attempted: subs.length,
    delivered,
    removedExpired: expiredEndpoints.length,
  };
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!ensureConfigured()) {
    return { attempted: 0, delivered: 0, removedExpired: 0 } satisfies SendResult;
  }
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { attempted: 0, delivered: 0, removedExpired: 0 } satisfies SendResult;
  }
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);
  if (!subs || subs.length === 0) {
    return { attempted: 0, delivered: 0, removedExpired: 0 } satisfies SendResult;
  }

  const json = JSON.stringify(payload);
  let delivered = 0;
  const expiredEndpoints: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          json,
        );
        delivered += 1;
      } catch (err: unknown) {
        const status =
          typeof err === "object" && err !== null && "statusCode" in err
            ? Number((err as { statusCode: number }).statusCode)
            : 0;
        if (status === 404 || status === 410) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    }),
  );

  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }

  return {
    attempted: subs.length,
    delivered,
    removedExpired: expiredEndpoints.length,
  } satisfies SendResult;
}

export function isPushConfigured() {
  return Boolean(env.vapidPublicKey && env.vapidPrivateKey);
}

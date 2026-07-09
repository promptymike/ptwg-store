"use client";

import { useEffect } from "react";
import { track as vercelTrack } from "@vercel/analytics";

// Operational telemetry, not marketing: client-side crashes are reported
// regardless of the analytics consent (no user identifiers beyond the
// existing anonymous visitor id, no PII in the payload).

const VISITOR_KEY = "templify:visitor-id";
const MAX_REPORTS_PER_PAGELOAD = 5;

let reportsSent = 0;

function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const next = `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(VISITOR_KEY, next);
    return next;
  } catch {
    return "v-anon";
  }
}

export function reportClientError(input: {
  message: string;
  source?: string;
  stack?: string;
  digest?: string;
}) {
  if (reportsSent >= MAX_REPORTS_PER_PAGELOAD) return;
  reportsSent += 1;

  const message = String(input.message ?? "unknown").slice(0, 300);
  const path = window.location.pathname;

  const body = JSON.stringify({
    name: "client_error",
    visitorId: getVisitorId(),
    path,
    properties: {
      message,
      source: input.source?.slice(0, 200),
      stack: input.stack?.slice(0, 600),
      digest: input.digest,
      userAgent: navigator.userAgent.slice(0, 200),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    },
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/event",
        new Blob([body], { type: "application/json" }),
      );
    } else {
      void fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    // never let error reporting throw
  }

  try {
    // Also surfaces in Vercel → Analytics → Events for a quick glance.
    vercelTrack("client_error", { message, path });
  } catch {
    // ignore
  }
}

/** Global listeners for uncaught errors and promise rejections. */
export function ErrorReporter() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      reportClientError({
        message: event.message,
        source: `${event.filename ?? ""}:${event.lineno ?? 0}`,
        stack: event.error instanceof Error ? event.error.stack : undefined,
      });
    }

    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      reportClientError({
        message:
          reason instanceof Error
            ? reason.message
            : `unhandledrejection: ${String(reason).slice(0, 200)}`,
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}

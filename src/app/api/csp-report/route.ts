import { NextResponse } from "next/server";

// Collector for Content-Security-Policy-Report-Only violations. Browsers POST
// either the legacy `application/csp-report` body or the newer Reporting API
// `application/reports+json` array. We just log a trimmed summary so we can see
// which directives need widening before flipping CSP to enforcing. No auth —
// reports are unauthenticated by design — but we cap the body and never persist.
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16_000;

function summarize(report: unknown) {
  if (!report || typeof report !== "object") return null;
  const r = report as Record<string, unknown>;
  // Legacy shape nests under "csp-report"; Reporting API nests under "body".
  const body = (r["csp-report"] ?? r.body ?? r) as Record<string, unknown>;
  return {
    blocked: body["blocked-uri"] ?? body.blockedURL ?? null,
    directive:
      body["violated-directive"] ?? body.effectiveDirective ?? null,
    document: body["document-uri"] ?? body.documentURL ?? null,
  };
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 204 });
    }

    const parsed = JSON.parse(raw) as unknown;
    const reports = Array.isArray(parsed) ? parsed : [parsed];
    for (const report of reports.slice(0, 10)) {
      const summary = summarize(report);
      if (summary?.blocked) {
        console.warn("[csp-report]", summary);
      }
    }
  } catch {
    // Ignore malformed reports — they must never surface to the user.
  }

  return new NextResponse(null, { status: 204 });
}

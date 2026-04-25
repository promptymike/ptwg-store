import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

function csvEscape(value: string | null | undefined) {
  if (!value) return "";
  const stringified = String(value);
  if (/[",\n\r]/.test(stringified)) {
    return `"${stringified.replace(/"/g, '""')}"`;
  }
  return stringified;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const sessionSupabase = await createSupabaseServerClient();
  if (!sessionSupabase) {
    return NextResponse.json({ message: "Supabase missing" }, { status: 500 });
  }
  const { data: profile } = await sessionSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase admin missing" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("email, source, consent, unsubscribed_at, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const header = "email,source,consent,status,subscribed_at\n";
  const rows = (data ?? []).map((row) => {
    const status = row.unsubscribed_at ? "unsubscribed" : "active";
    return [
      csvEscape(row.email),
      csvEscape(row.source),
      row.consent ? "true" : "false",
      status,
      csvEscape(row.created_at),
    ].join(",");
  });

  const csv = header + rows.join("\n") + "\n";
  const filename = `templify-newsletter-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

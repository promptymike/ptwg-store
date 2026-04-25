import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/session";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

function csvEscape(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
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
    .from("orders")
    .select(
      "id, email, total, subtotal, currency, status, created_at, stripe_checkout_session_id, stripe_payment_intent_id, order_items(product_name, quantity, unit_price)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const header =
    "order_id,email,total,subtotal,currency,status,created_at,products,quantity,stripe_session,stripe_payment_intent\n";
  type Row = {
    id: string;
    email: string;
    total: number;
    subtotal: number;
    currency: string;
    status: string;
    created_at: string;
    stripe_checkout_session_id: string | null;
    stripe_payment_intent_id: string | null;
    order_items?: Array<{
      product_name: string;
      quantity: number;
      unit_price: number;
    }>;
  };

  const rows = ((data as Row[]) ?? []).map((row) => {
    const products = (row.order_items ?? [])
      .map((item) => `${item.product_name} x${item.quantity}`)
      .join(" | ");
    const totalQuantity = (row.order_items ?? []).reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    return [
      csvEscape(row.id),
      csvEscape(row.email),
      csvEscape(row.total),
      csvEscape(row.subtotal),
      csvEscape(row.currency),
      csvEscape(row.status),
      csvEscape(row.created_at),
      csvEscape(products),
      csvEscape(totalQuantity),
      csvEscape(row.stripe_checkout_session_id),
      csvEscape(row.stripe_payment_intent_id),
    ].join(",");
  });

  const csv = header + rows.join("\n") + (rows.length ? "\n" : "");
  const filename = `templify-zamowienia-${new Date()
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

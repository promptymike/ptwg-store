"use server";

import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

const lookupSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3)
    .max(40)
    .regex(/^[A-Z0-9_-]+$/, "Kod zawiera niedozwolone znaki"),
  email: z.string().trim().toLowerCase().email("Niepoprawny adres e-mail"),
});

export type PartnerReferralRow = {
  customerEmail: string;
  grossAmount: number;
  commission: number;
  status: string;
  createdAt: string;
};

export type PartnerLookupState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      affiliate: {
        code: string;
        name: string;
        percentCommission: number;
      };
      totals: {
        count: number;
        gross: number;
        commission: number;
      };
      referrals: PartnerReferralRow[];
    };

export async function lookupPartnerStatsAction(
  _prev: PartnerLookupState,
  formData: FormData,
): Promise<PartnerLookupState> {
  const parsed = lookupSchema.safeParse({
    code: formData.get("code") ?? "",
    email: formData.get("email") ?? "",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ?? "Sprawdź kod partnera i e-mail.",
    };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      status: "error",
      message: "Statystyki partnerów są chwilowo niedostępne.",
    };
  }

  const { data: affiliate, error: affiliateError } = await supabase
    .from("affiliates")
    .select("id, code, name, email, percent_commission, is_active")
    .eq("code", parsed.data.code)
    .maybeSingle();

  if (affiliateError) {
    return {
      status: "error",
      message: "Nie udało się sprawdzić kodu. Spróbuj ponownie za chwilę.",
    };
  }

  // Use one generic message for "wrong code" + "wrong email" + "inactive"
  // to avoid leaking which codes exist in the program.
  const genericMismatch =
    "Nie znaleźliśmy aktywnego konta dla podanego kodu i e-maila.";

  if (!affiliate || !affiliate.is_active) {
    return { status: "error", message: genericMismatch };
  }

  if (
    !affiliate.email ||
    affiliate.email.trim().toLowerCase() !== parsed.data.email
  ) {
    return { status: "error", message: genericMismatch };
  }

  const { data: referralRows, error: referralError } = await supabase
    .from("affiliate_referrals")
    .select("customer_email, gross_amount, commission, status, created_at")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (referralError) {
    return {
      status: "error",
      message: "Nie udało się pobrać statystyk. Spróbuj ponownie za chwilę.",
    };
  }

  const referrals: PartnerReferralRow[] = (referralRows ?? []).map((row) => ({
    customerEmail: maskEmail(row.customer_email),
    grossAmount: row.gross_amount,
    commission: row.commission,
    status: row.status,
    createdAt: row.created_at,
  }));

  const totals = referrals.reduce(
    (acc, ref) => ({
      count: acc.count + 1,
      gross: acc.gross + ref.grossAmount,
      commission: acc.commission + ref.commission,
    }),
    { count: 0, gross: 0, commission: 0 },
  );

  return {
    status: "ok",
    affiliate: {
      code: affiliate.code,
      name: affiliate.name,
      percentCommission: affiliate.percent_commission,
    },
    totals,
    referrals,
  };
}

// Partner sees their referrals but should never get raw buyer emails — that
// would let a bad-actor partner enumerate the customer base. We surface
// enough to confirm the entry without exposing PII.
function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
}

export type PromoRule = {
  code: string;
  label: string;
  percentOff: number;
};

const PROMO_RULES: PromoRule[] = [
  { code: "TEMPLIFY15", label: "Wiosenny rabat −15%", percentOff: 15 },
  { code: "WELCOME10", label: "Powitalne −10%", percentOff: 10 },
];

export function findPromoRule(rawCode: string | null | undefined): PromoRule | null {
  if (!rawCode) return null;
  const normalized = rawCode.trim().toUpperCase();
  return PROMO_RULES.find((rule) => rule.code === normalized) ?? null;
}

export function applyPromoPercent(amountInMinorUnits: number, percentOff: number) {
  const discounted = Math.round(amountInMinorUnits * (1 - percentOff / 100));
  return Math.max(discounted, 0);
}

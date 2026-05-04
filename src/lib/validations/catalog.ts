import { z } from "zod";

const attributionSchema = z.object({
  utm_source: z.string().trim().max(180).optional(),
  utm_medium: z.string().trim().max(180).optional(),
  utm_campaign: z.string().trim().max(180).optional(),
  utm_content: z.string().trim().max(180).optional(),
  utm_term: z.string().trim().max(180).optional(),
  referrer: z.string().trim().max(300).optional(),
  landing_page: z.string().trim().max(300).optional(),
  captured_at: z.string().trim().max(80).optional(),
});

export const checkoutSchema = z.object({
  email: z.email("Podaj poprawny e-mail do potwierdzenia."),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1, "Koszyk nie może być pusty."),
  promoCode: z.string().trim().max(40).optional(),
  orderBumpProductId: z.string().trim().min(1).optional(),
  giftCode: z.string().trim().max(40).optional(),
  affiliateRef: z
    .string()
    .trim()
    .toUpperCase()
    .max(40)
    .regex(/^[A-Z0-9_-]+$/)
    .optional()
    .or(z.literal("")),
  attribution: attributionSchema.optional(),
});

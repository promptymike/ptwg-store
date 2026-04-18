import { z } from "zod";

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
});

import { z } from "zod";

import { CATEGORY_OPTIONS } from "@/types/store";

export const productFormSchema = z.object({
  name: z.string().min(3, "Nazwa produktu jest za krótka."),
  slug: z
    .string()
    .min(3, "Slug jest za krótki.")
    .regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki."),
  category: z.enum(CATEGORY_OPTIONS, {
    message: "Wybierz kategorię produktu.",
  }),
  price: z.coerce.number().min(1, "Cena musi być większa od zera."),
  description: z.string().min(20, "Opis powinien mieć co najmniej 20 znaków."),
});

export const categoryFormSchema = z.object({
  name: z.enum(CATEGORY_OPTIONS, {
    message: "Wybierz istniejącą kategorię MVP.",
  }),
  description: z.string().min(12, "Dodaj krótki opis kategorii."),
});

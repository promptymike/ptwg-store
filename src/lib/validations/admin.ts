import { z } from "zod";

export const productFormSchema = z.object({
  productId: z.string().uuid().optional(),
  name: z.string().min(3, "Nazwa produktu jest za krótka."),
  slug: z
    .string()
    .min(3, "Slug jest za krótki.")
    .regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki."),
  categoryId: z.string().uuid("Wybierz kategorię produktu."),
  price: z.coerce.number().min(1, "Cena musi być większa od zera."),
  compareAtPrice: z.coerce.number().min(0, "Cena porównawcza nie może być ujemna.").optional(),
  shortDescription: z
    .string()
    .min(12, "Krótki opis powinien mieć co najmniej 12 znaków."),
  description: z.string().min(20, "Opis powinien mieć co najmniej 20 znaków."),
  format: z.string().min(2, "Podaj format produktu."),
  pages: z.coerce.number().int().min(0, "Liczba stron nie może być ujemna."),
  salesLabel: z.string().min(4, "Dodaj krótką etykietę sprzedażową."),
  heroNote: z.string().min(4, "Dodaj krótką notatkę hero."),
  accent: z.string().min(5, "Podaj klasę gradientu accent."),
  coverGradient: z.string().min(5, "Podaj klasę gradientu okładki."),
  tags: z.string().optional(),
  includes: z.string().optional(),
  bestseller: z.boolean().optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const categoryFormSchema = z.object({
  categoryId: z.string().uuid().optional(),
  slug: z
    .string()
    .min(3, "Slug jest za krótki.")
    .regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki."),
  name: z.string().min(2, "Nazwa kategorii jest za krótka."),
  description: z.string().min(12, "Dodaj krótki opis kategorii."),
  sortOrder: z.coerce.number().int().min(0, "Sortowanie nie może być ujemne."),
  isActive: z.boolean().optional(),
});

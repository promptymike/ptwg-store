import { z } from "zod";

import { PRODUCT_BADGES, PRODUCT_STATUSES } from "@/types/store";

export const productFormSchema = z.object({
  productId: z.string().uuid().optional(),
  name: z.string().min(3, "Nazwa produktu jest za krótka."),
  slug: z
    .string()
    .min(3, "Slug jest za krótki.")
    .regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki."),
  categoryId: z.string().uuid("Wybierz kategorię produktu."),
  price: z.coerce.number().min(1, "Cena musi być większa od zera."),
  compareAtPrice: z
    .coerce
    .number()
    .min(0, "Cena porównawcza nie może być ujemna.")
    .optional(),
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
  badge: z.enum(PRODUCT_BADGES).nullable().optional(),
  status: z.enum(PRODUCT_STATUSES),
  sortOrder: z.coerce.number().int().min(0, "Sortowanie nie może być ujemne."),
  featuredOrder: z.coerce
    .number()
    .int()
    .min(0, "Kolejność featured nie może być ujemna."),
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

export const previewFormSchema = z.object({
  productId: z.string().uuid("Brak produktu dla podglądu."),
  altText: z.string().max(160, "Alt tekst jest za długi.").optional(),
  sortOrder: z.coerce.number().int().min(0, "Sortowanie nie może być ujemne."),
});

export const contentSectionFormSchema = z.object({
  sectionId: z.string().uuid("Brak sekcji.").optional(),
  eyebrow: z.string().min(2, "Dodaj krótką etykietę sekcji."),
  title: z.string().min(6, "Tytuł sekcji jest za krótki."),
  description: z.string().min(12, "Opis sekcji jest za krótki."),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const contentPageFormSchema = z.object({
  pageId: z.string().uuid("Brak strony.").optional(),
  slug: z
    .string()
    .min(3, "Slug jest za krótki.")
    .regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki."),
  title: z.string().min(3, "Tytuł strony jest za krótki."),
  description: z.string().min(12, "Opis strony jest za krótki."),
  body: z.string().min(20, "Treść strony jest za krótka."),
  isPublished: z.boolean().optional(),
});

export const faqFormSchema = z.object({
  faqId: z.string().uuid("Brak wpisu FAQ.").optional(),
  question: z.string().min(8, "Pytanie jest za krótkie."),
  answer: z.string().min(12, "Odpowiedź jest za krótka."),
  sortOrder: z.coerce.number().int().min(0, "Sortowanie nie może być ujemne."),
  isPublished: z.boolean().optional(),
});

export const testimonialFormSchema = z.object({
  testimonialId: z.string().uuid("Brak opinii.").optional(),
  author: z.string().min(2, "Podaj autora opinii."),
  role: z.string().min(2, "Podaj rolę lub firmę."),
  quote: z.string().min(12, "Cytat jest za krótki."),
  score: z.coerce.number().min(0).max(5),
  sortOrder: z.coerce.number().int().min(0, "Sortowanie nie może być ujemne."),
  isPublished: z.boolean().optional(),
});

export const allowlistFormSchema = z.object({
  allowlistId: z.string().uuid("Brak wpisu allowlisty.").optional(),
  email: z.email("Podaj poprawny adres e-mail."),
  note: z.string().max(120, "Notatka jest za długa.").optional(),
  isActive: z.boolean().optional(),
});

export const siteSettingsFormSchema = z.object({
  recommendedBundleId: z.string().min(1, "Wybierz rekomendowany bundle."),
  homepageFeaturedLimit: z.coerce
    .number()
    .int()
    .min(1, "Limit featured musi być większy od zera.")
    .max(12, "Limit featured jest za duży."),
});

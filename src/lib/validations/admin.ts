import { z } from "zod";

import {
  PRODUCT_BADGES,
  PRODUCT_PIPELINE_STATUSES,
  PRODUCT_STATUSES,
} from "@/types/store";

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeOptionalNumberInput(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeOptionalBadge(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export const productFormSchema = z.object({
  productId: z.preprocess(normalizeOptionalString, z.string().uuid().optional()),
  sourceId: z.preprocess(normalizeOptionalString, z.string().uuid().optional()),
  name: z.string().min(3, "Nazwa produktu jest za krotka."),
  slug: z
    .string()
    .min(3, "Slug jest za krotki.")
    .regex(/^[a-z0-9-]+$/, "Slug moze zawierac tylko male litery, cyfry i myslniki."),
  categoryId: z.string().uuid("Wybierz kategorie produktu."),
  price: z.coerce.number().min(1, "Cena musi byc wieksza od zera."),
  compareAtPrice: z.preprocess(
    normalizeOptionalNumberInput,
    z.coerce
      .number()
      .min(0, "Cena porownawcza nie moze byc ujemna.")
      .optional(),
  ),
  shortDescription: z
    .string()
    .min(12, "Krotki opis powinien miec co najmniej 12 znakow."),
  description: z.string().min(20, "Opis powinien miec co najmniej 20 znakow."),
  format: z.string().min(2, "Podaj format produktu."),
  pages: z.coerce.number().int().min(0, "Liczba stron nie moze byc ujemna."),
  salesLabel: z.string().min(4, "Dodaj krotka etykiete sprzedazowa."),
  heroNote: z.string().min(4, "Dodaj krotka notatke hero."),
  accent: z.string().min(5, "Podaj klase gradientu accent."),
  coverGradient: z.string().min(5, "Podaj klase gradientu okladki."),
  badge: z.preprocess(
    normalizeOptionalBadge,
    z.enum(PRODUCT_BADGES).nullable().optional(),
  ),
  status: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim().length > 0 ? value : "draft",
    z.enum(PRODUCT_STATUSES),
  ),
  pipelineStatus: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim().length > 0 ? value : "working",
    z.enum(PRODUCT_PIPELINE_STATUSES),
  ),
  sortOrder: z.coerce.number().int().min(0, "Sortowanie nie moze byc ujemne."),
  featuredOrder: z.coerce
    .number()
    .int()
    .min(0, "Kolejnosc featured nie moze byc ujemna."),
  tags: z.preprocess(normalizeOptionalString, z.string().optional()),
  includes: z.preprocess(normalizeOptionalString, z.string().optional()),
  bestseller: z.boolean().optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const categoryFormSchema = z.object({
  categoryId: z.string().uuid().optional(),
  slug: z
    .string()
    .min(3, "Slug jest za krotki.")
    .regex(/^[a-z0-9-]+$/, "Slug moze zawierac tylko male litery, cyfry i myslniki."),
  name: z.string().min(2, "Nazwa kategorii jest za krotka."),
  description: z.string().min(12, "Dodaj krotki opis kategorii."),
  sortOrder: z.coerce.number().int().min(0, "Sortowanie nie moze byc ujemne."),
  isActive: z.boolean().optional(),
});

export const previewFormSchema = z.object({
  productId: z.string().uuid("Brak produktu dla podgladu."),
  altText: z.string().max(160, "Alt tekst jest za dlugi.").optional(),
  sortOrder: z.coerce.number().int().min(0, "Sortowanie nie moze byc ujemne."),
});

export const contentSectionFormSchema = z.object({
  sectionId: z.string().uuid("Brak sekcji.").optional(),
  eyebrow: z.string().min(2, "Dodaj krotka etykiete sekcji."),
  title: z.string().min(6, "Tytul sekcji jest za krotki."),
  description: z.string().min(12, "Opis sekcji jest za krotki."),
  body: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const contentPageFormSchema = z.object({
  pageId: z.string().uuid("Brak strony.").optional(),
  slug: z
    .string()
    .min(3, "Slug jest za krotki.")
    .regex(/^[a-z0-9-]+$/, "Slug moze zawierac tylko male litery, cyfry i myslniki."),
  title: z.string().min(3, "Tytul strony jest za krotki."),
  description: z.string().min(12, "Opis strony jest za krotki."),
  body: z.string().min(20, "Tresc strony jest za krotka."),
  isPublished: z.boolean().optional(),
});

export const faqFormSchema = z.object({
  faqId: z.string().uuid("Brak wpisu FAQ.").optional(),
  question: z.string().min(8, "Pytanie jest za krotkie."),
  answer: z.string().min(12, "Odpowiedz jest za krotka."),
  sortOrder: z.coerce.number().int().min(0, "Sortowanie nie moze byc ujemne."),
  isPublished: z.boolean().optional(),
});

export const testimonialFormSchema = z.object({
  testimonialId: z.string().uuid("Brak opinii.").optional(),
  author: z.string().min(2, "Podaj autora opinii."),
  role: z.string().min(2, "Podaj role lub firme."),
  quote: z.string().min(12, "Cytat jest za krotki."),
  score: z.coerce.number().min(0).max(5),
  sortOrder: z.coerce.number().int().min(0, "Sortowanie nie moze byc ujemne."),
  isPublished: z.boolean().optional(),
});

export const allowlistFormSchema = z.object({
  allowlistId: z.string().uuid("Brak wpisu allowlisty.").optional(),
  email: z.email("Podaj poprawny adres e-mail."),
  note: z.string().max(120, "Notatka jest za dluga.").optional(),
  isActive: z.boolean().optional(),
});

export const siteSettingsFormSchema = z.object({
  recommendedBundleId: z.string().min(1, "Wybierz rekomendowany bundle."),
  homepageFeaturedLimit: z.coerce
    .number()
    .int()
    .min(1, "Limit featured musi byc wiekszy od zera.")
    .max(12, "Limit featured jest za duzy."),
  businessName: z.string().max(120, "Nazwa firmy jest zbyt dluga.").optional(),
  businessTaxId: z.string().max(32, "NIP jest zbyt dlugi.").optional(),
  businessAddress: z.string().max(240, "Adres jest zbyt dlugi.").optional(),
  supportEmail: z.email("Podaj poprawny adres e-mail wsparcia."),
});

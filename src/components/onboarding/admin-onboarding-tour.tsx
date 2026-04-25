"use client";

import {
  OnboardingTour,
  type OnboardingStep,
} from "@/components/onboarding/onboarding-tour";

const ADMIN_STEPS: OnboardingStep[] = [
  {
    title: "Dashboard — wszystko co dzieje się dziś",
    body: "Karty z przychodem, subskrybentami, opiniami do moderacji, brakami w katalogu + feed ostatnich zdarzeń. Tu wracasz pierwszą rzeczą rano.",
    href: "/admin",
    hrefLabel: "Otwórz dashboard",
  },
  {
    title: "Produkty — sercem sklepu",
    body: "Dodajesz i edytujesz ebooki + planery. Okładka, opis, plik HTML/PDF, screenshoty, cena, status (draft / published). Po publikacji od razu w sklepie.",
    href: "/admin/produkty",
    hrefLabel: "Otwórz Produkty",
  },
  {
    title: "Pakiety — łącz produkty z rabatem",
    body: 'Stwórz pakiet 2-3 ebooków za niższą cenę niż suma. Multi-select produktów, presety motywu, cena. Pojawi się na home w sekcji „Pakiety" + jednym kliknięciem prowadzi do Stripe.',
    href: "/admin/pakiety",
    hrefLabel: "Otwórz Pakiety",
  },
  {
    title: "Import — szybki onboarding nowych ebooków",
    body: "Pliki z Google Drive albo gotową strukturę wrzucasz tu bez tworzenia produktu od zera. Przyspiesza dodanie 5-10 nowych pozycji.",
    href: "/admin/import",
    hrefLabel: "Otwórz Import",
  },
  {
    title: "Kategorie — porządek w katalogu",
    body: 'Nazwy i kolejność kategorii (Finanse, Zdrowie, Macierzyństwo…). Sterują filtrem na /produkty + sekcją „Klienci kupują też".',
    href: "/admin/kategorie",
    hrefLabel: "Otwórz Kategorie",
  },
  {
    title: "Zamówienia — historia transakcji",
    body: "Każde opłacone Stripe Checkout trafia tu automatycznie z fakturą, e-mailem klienta i listą produktów. Stąd robisz refundy.",
    href: "/admin/zamowienia",
    hrefLabel: "Otwórz Zamówienia",
  },
  {
    title: "Recenzje — moderacja opinii",
    body: "Tylko właściciele produktu mogą napisać opinię (RLS). Filtrujesz po pending / approved / rejected, zatwierdzasz jednym kliknięciem. Opinie zasilają gwiazdki w Google.",
    href: "/admin/recenzje",
    hrefLabel: "Otwórz Recenzje",
  },
  {
    title: "Newsletter — lista subskrybentów",
    body: "Adresy zapisane przez formularz w stopce + na home. Eksport do CSV jednym kliknięciem (możesz przenieść gdziekolwiek). Welcome email leci automatycznie z linkiem do bezpłatnej próbki.",
    href: "/admin/newsletter",
    hrefLabel: "Otwórz Newsletter",
  },
  {
    title: "Blog — SEO moat na lata",
    body: "Markdown editor z podglądem, statusy draft/published/archived, tagi, czas czytania. Każdy wpis ląduje w sitemapie + Article schema dla Google. Pisz 1 wpis na 2 tygodnie pod konkretne hasła.",
    href: "/admin/blog",
    hrefLabel: "Otwórz Blog",
  },
  {
    title: "Content — teksty marketingowe i prawne",
    body: "Hero, FAQ, regulamin, polityka prywatności — wszystko edytujesz bez deployu. Zmiany na żywo natychmiast po zapisie.",
    href: "/admin/content",
    hrefLabel: "Otwórz Content",
  },
  {
    title: "Admini — kto ma dostęp",
    body: "Zarządzasz uprawnieniami. Dodaj współpracownika jako admina lub zostaw jako zwykłego klienta.",
    href: "/admin/admini",
    hrefLabel: "Otwórz Admini",
  },
  {
    title: "Ustawienia — dane firmy i kontakt",
    body: "Nazwa firmy, NIP, adres, e-mail wsparcia. Te dane lecą na faktury, do stopki i do automatycznych maili. Wypełnij PRZED pierwszą prawdziwą sprzedażą.",
    href: "/admin/ustawienia",
    hrefLabel: "Otwórz Ustawienia",
  },
];

export function AdminOnboardingTour() {
  // Bumped to v2 so anyone who already saw v1 (without Pakiety / Recenzje
  // / Newsletter / Blog) gets the refreshed walkthrough exactly once.
  return (
    <OnboardingTour
      id="admin-tour-v2"
      intro={{
        eyebrow: "Witaj w panelu admina",
        title: "Pokażę Ci panel w 12 krokach",
        body: "Każdy moduł w 1-2 zdaniach — wiedz gdzie co kliknąć. Możesz pominąć w każdej chwili (Esc albo X), samouczek pokazuje się tylko raz.",
      }}
      steps={ADMIN_STEPS}
    />
  );
}

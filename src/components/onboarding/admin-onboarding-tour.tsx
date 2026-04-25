"use client";

import {
  OnboardingTour,
  type OnboardingStep,
} from "@/components/onboarding/onboarding-tour";

const ADMIN_STEPS: OnboardingStep[] = [
  {
    title: "Dashboard — szybki przegląd",
    body: "Pierwsza zakładka pokazuje świeżość katalogu, liczbę zamówień i alerty. Tu wracasz, gdy chcesz w 5 sekund sprawdzić co się dzieje w sklepie.",
    href: "/admin",
    hrefLabel: "Otwórz dashboard",
  },
  {
    title: "Produkty — sercem sklepu",
    body: "Tu dodajesz i edytujesz ebooki + planery. Wgraj okładkę, opis, plik HTML/PDF, screenshoty preview, ustaw cenę i status (draft / published). Po publikacji produkt natychmiast pojawia się na storefroncie.",
    href: "/admin/produkty",
    hrefLabel: "Otwórz Produkty",
  },
  {
    title: "Import / Źródła — szybki onboarding nowych ebooków",
    body: "Jeśli masz pliki w Google Drive albo gotową strukturę — możesz je tu wrzucić bez tworzenia produktu od zera. Przyspiesza dodanie 5-10 nowych pozycji.",
    href: "/admin/import",
    hrefLabel: "Otwórz Import",
  },
  {
    title: "Kategorie — porządek w katalogu",
    body: 'Tu zmieniasz nazwy i kolejność kategorii (Finanse, Zdrowie, Macierzyństwo…). Kategoria steruje filtrem na /produkty oraz powiązaniami w sekcji „Klienci kupują też".',
    href: "/admin/kategorie",
    hrefLabel: "Otwórz Kategorie",
  },
  {
    title: "Zamówienia — pełna historia transakcji",
    body: "Każdy opłacony checkout ze Stripe trafia tutaj automatycznie z fakturą, e-mailem klienta i listą produktów. Stąd widzisz status fulfillmentu i możesz zwrócić zamówienie.",
    href: "/admin/zamowienia",
    hrefLabel: "Otwórz Zamówienia",
  },
  {
    title: "Content — teksty marketingowe i prawne",
    body: "Sekcje hero, FAQ, regulamin, polityka prywatności — wszystko edytujesz tu, bez deployu. Zmiany pojawiają się na żywo natychmiast po zapisie.",
    href: "/admin/content",
    hrefLabel: "Otwórz Content",
  },
  {
    title: "Admini — kto ma dostęp",
    body: "Tu zarządzasz uprawnieniami. Możesz dodać współpracownika jako admina (pełny dostęp) lub zostawić jako zwykłego klienta.",
    href: "/admin/admini",
    hrefLabel: "Otwórz Admini",
  },
  {
    title: "Ustawienia — dane firmy i kontakt",
    body: "Nazwa firmy, NIP, adres, e-mail wsparcia. Te dane lecą na faktury, do stopki sklepu i do automatycznych maili. Wypełnij to przed pierwszą prawdziwą sprzedażą.",
    href: "/admin/ustawienia",
    hrefLabel: "Otwórz Ustawienia",
  },
];

export function AdminOnboardingTour() {
  return (
    <OnboardingTour
      id="admin-tour-v1"
      intro={{
        eyebrow: "Witaj w panelu admina",
        title: "Pokażę Ci panel w 8 krokach",
        body: "Każda zakładka w 1 zdaniu — wiedz gdzie co kliknąć. Możesz pominąć w każdej chwili (Esc albo X), samouczek pokazuje się tylko raz.",
      }}
      steps={ADMIN_STEPS}
    />
  );
}

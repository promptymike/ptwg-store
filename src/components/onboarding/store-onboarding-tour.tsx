"use client";

import {
  OnboardingTour,
  type OnboardingStep,
} from "@/components/onboarding/onboarding-tour";

const STORE_STEPS: OnboardingStep[] = [
  {
    title: "Katalog z filtrowaniem",
    body: "Na /produkty znajdziesz wszystkie ebooki i planery. Filtruj po kategorii (np. Finanse, Macierzyństwo) lub typie (Ebook / Planer) — możesz łączyć oba.",
    href: "/produkty",
    hrefLabel: "Przeglądaj katalog",
  },
  {
    title: "Bezpłatna próbka przed zakupem",
    body: 'Każdy ebook ma przycisk „Pokaż bezpłatną próbkę". Otwiera pierwszych kilka stron w przeglądarce — żebyś wiedział czego się spodziewać, zanim zapłacisz.',
  },
  {
    title: "Koszyk i bezpieczna płatność",
    body: "Klik w ikonę koszyka u góry → mini koszyk z boku, edytujesz ilości lub idziesz do kasy. Płatność obsługuje Stripe (karta), faktura VAT przychodzi automatycznie.",
    href: "/koszyk",
    hrefLabel: "Otwórz koszyk",
  },
  {
    title: "Biblioteka — Twoje pliki",
    body: "Po zakupie produkty pojawiają się w bibliotece natychmiast. Otwierasz je w przeglądarce — bez instalacji. Dostęp jest bezterminowy.",
    href: "/biblioteka",
    hrefLabel: "Otwórz bibliotekę",
  },
  {
    title: "Czytnik z zakładkami i motywem",
    body: "W trakcie czytania masz pasek z postępem, zakładkami, spisem treści i ustawieniami (rozmiar tekstu, motyw jasny / sepia / ciemny). Postęp zapisuje się automatycznie — wracasz dokładnie tam, gdzie skończyłeś.",
  },
];

export function StoreOnboardingTour() {
  return (
    <OnboardingTour
      id="store-tour-v1"
      intro={{
        eyebrow: "Witaj w Templify",
        title: "5 sekund i już wiesz, jak korzystać",
        body: "Pokażę Ci najważniejsze rzeczy: katalog, próbka, koszyk, biblioteka, czytnik. Możesz pominąć w każdej chwili (Esc albo X) — samouczek pokazuje się tylko raz.",
      }}
      steps={STORE_STEPS}
    />
  );
}

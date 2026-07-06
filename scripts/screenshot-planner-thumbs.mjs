// Renders each interactive-planner template in headless Chromium and saves a
// real screenshot to public/planery-thumbs/{slug}.png. These become the
// storefront thumbnails, so cards show the actual product instead of a mock.
//
// Usage: node scripts/screenshot-planner-thumbs.mjs [slug ...]

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { chromium } from "@playwright/test";

const TEMPLATE_DIR = path.resolve("templates/interactive-planners");
const OUT_DIR = path.resolve("public/planery-thumbs");

// Demo data seeded into localStorage before load, so thumbnails show a lived-in
// dashboard instead of an empty state or onboarding screen. Shapes mirror each
// template's own storage layer (see the template source).
const FINANSOW_SEED = (() => {
  const t = (id, type, category, amount, date, description) => ({
    id,
    type,
    category,
    amount,
    date,
    description,
    goalId: null,
  });
  return {
    pw_transactions: [
      t(1, "income", "Wynagrodzenie", 6800, "2026-07-01", "Wypłata — lipiec"),
      t(2, "income", "Freelance", 1250, "2026-07-03", "Projekt logo"),
      t(3, "expense", "Rachunki", 1450, "2026-07-02", "Czynsz + media"),
      t(4, "expense", "Jedzenie", 238.4, "2026-07-03", "Zakupy spożywcze"),
      t(5, "expense", "Transport", 89, "2026-07-04", "Bilet miesięczny"),
      t(6, "expense", "Rozrywka", 120, "2026-07-04", "Kino i kolacja"),
      t(7, "expense", "Sport", 139, "2026-07-05", "Karnet na siłownię"),
      t(8, "expense", "Abonament", 29.99, "2026-07-05", "Streaming"),
      t(9, "expense", "Jedzenie", 164.2, "2026-07-06", "Zakupy na tydzień"),
      t(10, "income", "Wynagrodzenie", 6800, "2026-06-01", "Wypłata — czerwiec"),
      t(11, "expense", "Rachunki", 1450, "2026-06-02", "Czynsz + media"),
      t(12, "expense", "Jedzenie", 940, "2026-06-15", "Zakupy — czerwiec"),
      t(13, "expense", "Ubrania", 320, "2026-06-20", "Letnie ubrania"),
    ],
    pw_goals: [
      { id: 1, name: "Wakacje w Grecji", icon: "🏖️", target: 6000, current: 3900, deadline: "2026-09-01" },
      { id: 2, name: "Poduszka bezpieczeństwa", icon: "🛟", target: 15000, current: 8200, deadline: "2026-12-31" },
    ],
    pw_budgets: [
      { category: "Jedzenie", limit: 1200 },
      { category: "Transport", limit: 400 },
      { category: "Rozrywka", limit: 350 },
      { category: "Rachunki", limit: 1600 },
    ],
  };
})();

const PODROZY_SEED = {
  "planer-podroznika_anonymous_trips": [
    {
      id: "t1",
      name: "Lizbona i Porto",
      dest: "Portugalia",
      emoji: "🇵🇹",
      city: "Lizbona",
      style: "city",
      start: "2026-08-10",
      end: "2026-08-19",
      budget: 5400,
      currency: "EUR",
      persons: 2,
      status: "upcoming",
      desc: "Pastéis de nata, tramwaje i oceaniczny zachód słońca.",
      color1: "#7aafc4",
      color2: "#a89bc2",
      archived: false,
      createdAt: 1780000000000,
    },
    {
      id: "t2",
      name: "Toskania kamperem",
      dest: "Włochy",
      emoji: "🇮🇹",
      city: "Florencja",
      style: "roadtrip",
      start: "2026-09-14",
      end: "2026-09-24",
      budget: 7200,
      currency: "EUR",
      persons: 2,
      status: "planning",
      desc: "Winnice, cyprysy i mała trattoria pod Sieną.",
      color1: "#d4b483",
      color2: "#8faa8e",
      archived: false,
      createdAt: 1780500000000,
    },
  ],
};

const UROCZYSTOSCI_SEED = {
  "planer-imprez_anonymous_events": [
    {
      id: "e1",
      name: "Wesele Ani i Tomka",
      type: "wesele",
      date: "2026-09-12",
      location: "Dwór Bogucice",
      budget: 45000,
      guestsCount: 60,
      notes: "",
      createdAt: "2026-06-01T10:00:00.000Z",
    },
  ],
  "planer-imprez_anonymous_active_event": "e1",
  "planer-imprez_anonymous_event_e1_guests": [
    { id: "g1", name: "Anna Kowalska", rsvp: "confirmed", group: "Rodzina", plusOne: false },
    { id: "g2", name: "Jan Nowak", rsvp: "confirmed", group: "Przyjaciele", plusOne: true },
    { id: "g3", name: "Maria Wiśniewska", rsvp: "pending", group: "Praca", plusOne: false },
  ],
  "planer-imprez_anonymous_event_e1_tasks": [
    { id: "z1", name: "Rezerwacja sali", done: true, due: "2026-06-20" },
    { id: "z2", name: "Wybór zespołu", done: true, due: "2026-07-01" },
    { id: "z3", name: "Degustacja menu", done: false, due: "2026-07-18" },
  ],
};

const BUDOWY_SEED = {
  "budowa-planer_anonymous_project": {
    name: "Dom pod Krakowem",
    budget: 620000,
    startDate: "2026-04-01",
    endDate: "2027-06-30",
    address: "Zielonki, ul. Słoneczna 12",
  },
  "budowa-planer_anonymous_profile": "builder",
  "budowa-planer_anonymous_categories": [
    { id: "c1", name: "Fundamenty", planned: 95000, color: "primary" },
    { id: "c2", name: "Stan surowy", planned: 210000, color: "success" },
    { id: "c3", name: "Dach", planned: 120000, color: "warning" },
    { id: "c4", name: "Instalacje", planned: 90000, color: "error" },
    { id: "c5", name: "Wykończenie", planned: 105000, color: "primary" },
  ],
};

const MEALMIND_SEED = {
  mm_onboarding_done: true,
};

const PLANNERS = [
  { slug: "planer-finansow", file: "planer-finansow.html", seed: FINANSOW_SEED },
  { slug: "adhd-flow", file: "adhd-flow.html" },
  { slug: "planer-rodzinny", file: "planer-rodzinny.html" },
  { slug: "mealmind", file: "mealmind.html", seed: MEALMIND_SEED },
  { slug: "planer-podrozy", file: "planer-podrozy.html", seed: PODROZY_SEED },
  { slug: "planer-uroczystosci", file: "planer-uroczystosci.html", seed: UROCZYSTOSCI_SEED },
  { slug: "grafik-pracy", file: "grafik-pracy.html" },
  { slug: "beauty-pro", file: "beauty-pro.html" },
  { slug: "planer-budowy", file: "planer-budowy.html", seed: BUDOWY_SEED },
];

const requested = process.argv.slice(2);
const targets = requested.length
  ? PLANNERS.filter((planner) => requested.includes(planner.slug))
  : PLANNERS;

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

for (const planner of targets) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  if (planner.seed) {
    await page.addInitScript((seed) => {
      for (const [key, value] of Object.entries(seed)) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    }, planner.seed);
  }

  const url = pathToFileURL(path.join(TEMPLATE_DIR, planner.file)).href;
  await page.goto(url, { waitUntil: "networkidle" });
  // Give client-side init (charts, seeded demo data) a beat to paint.
  await page.waitForTimeout(1500);

  const outPath = path.join(OUT_DIR, `${planner.slug}.jpg`);
  await page.screenshot({ path: outPath, type: "jpeg", quality: 80 });
  console.log(`✓ ${planner.slug} → ${path.relative(process.cwd(), outPath)}`);
  await page.close();
}

await browser.close();

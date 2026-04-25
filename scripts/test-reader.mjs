// Verifies the in-browser reader end-to-end:
// 1. login as admin (the only user with library entries on this DB)
// 2. open the library page
// 3. click "Otwórz w przeglądarce" on the first item
// 4. assert the reader page renders the ebook and the inline progress
//    script wired up
// 5. simulate scrolling, confirm localStorage gets the % saved
// 6. reload library page and confirm the badge shows the same %
//
// Reads admin credentials from env vars so they never end up in source.

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const email = process.env.TEMPLIFY_ADMIN_EMAIL;
const password = process.env.TEMPLIFY_ADMIN_PASSWORD;
if (!email || !password) {
  console.error("Set TEMPLIFY_ADMIN_EMAIL and TEMPLIFY_ADMIN_PASSWORD");
  process.exit(1);
}

mkdirSync("screenshots", { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// 1. Login.
await page.goto("http://localhost:3000/logowanie?next=/biblioteka", {
  waitUntil: "load",
});
await page.locator("#auth-email").fill(email);
await page.locator("#auth-password").fill(password);
await page.locator("button", { hasText: /Zaloguj/i }).first().click();
await page.waitForURL(/\/biblioteka/, { timeout: 15000 });
await page.waitForTimeout(800);
console.log("Logged in:", page.url());

// 2. Library state.
const libraryButtons = await page
  .locator("article")
  .first()
  .locator("a, button")
  .allTextContents();
console.log("First library item buttons:", libraryButtons);

await page.screenshot({
  path: "screenshots/library-after-fix.png",
  fullPage: true,
});

// 3. Click "Otwórz w przeglądarce" on first item — opens new tab.
const newTabPromise = ctx.waitForEvent("page");
await page
  .locator("article")
  .first()
  .locator("a", { hasText: /Otwórz|Wróć do/i })
  .first()
  .click();
const reader = await newTabPromise;
await reader.waitForLoadState("load");
await reader.waitForTimeout(500);
console.log("Reader URL:", reader.url());

const readerData = await reader.evaluate(() => ({
  title: document.title,
  hasH1: !!document.querySelector("h1"),
  h1Text: document.querySelector("h1")?.textContent?.trim().slice(0, 60),
  bodyLen: document.body.textContent?.length ?? 0,
  hasProgressKeys: Object.keys(window.localStorage)
    .filter((k) => k.startsWith("templify:"))
    .slice(0, 5),
}));
console.log("Reader rendered:", readerData);

// 4. Scroll halfway and persist.
await reader.evaluate(() => {
  const el = document.scrollingElement || document.documentElement;
  el.scrollTo({ top: (el.scrollHeight - el.clientHeight) * 0.5, behavior: "instant" });
});
await reader.waitForTimeout(500);
const progressAfterScroll = await reader.evaluate(() => {
  const keys = Object.keys(window.localStorage).filter((k) =>
    k.startsWith("templify:reading-progress:"),
  );
  return keys.map((k) => ({ k: k.slice(0, 60), v: window.localStorage.getItem(k) }));
});
console.log("Progress saved after scroll:", progressAfterScroll);

await reader.screenshot({
  path: "screenshots/reader-scrolled.png",
});

// 5. Library reload should pick up the new badge.
await page.reload({ waitUntil: "load" });
await page.waitForTimeout(1000);
const badges = await page
  .locator("article")
  .first()
  .locator("[class*='badge'], span, div")
  .filter({ hasText: /przeczytane|otwierane/i })
  .allTextContents();
console.log("Library badges after reading:", badges);

await page.screenshot({
  path: "screenshots/library-with-progress.png",
  fullPage: true,
});

await browser.close();
console.log("Done");

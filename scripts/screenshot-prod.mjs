import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("screenshots", { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
for (const [url, name] of [
  ["https://templify.pl/", "prod-home"],
  ["https://templify.pl/produkty", "prod-catalog"],
  [
    "https://templify.pl/produkty/budzet-domowy-dla-poczatkujacych",
    "prod-product",
  ],
]) {
  await page.goto(url, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: `screenshots/${name}.png`,
    fullPage: true,
  });
}
await browser.close();
console.log("Done");

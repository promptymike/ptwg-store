import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("screenshots", { recursive: true });

const browser = await chromium.launch();
for (const [vw, vh, label] of [
  [1440, 900, "desktop"],
  [390, 844, "mobile"],
]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  const page = await ctx.newPage();
  for (const [url, name] of [
    ["http://localhost:3000/", "home"],
    ["http://localhost:3000/produkty", "catalog"],
    ["http://localhost:3000/produkty/budzet-domowy-dla-poczatkujacych", "product-budzet"],
    ["http://localhost:3000/produkty/adhd-planner-dla-doroslych", "product-adhd"],
    ["http://localhost:3000/produkty/macierzynstwo-od-a-do-z", "product-macierzynstwo"],
    ["http://localhost:3000/koszyk", "cart-empty"],
  ]) {
    try {
      await page.goto(url, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(800);
      await page.screenshot({
        path: `screenshots/${label}-${name}.png`,
        fullPage: true,
      });
    } catch (e) {
      console.log(`FAIL ${url}: ${e.message.slice(0, 60)}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log("Screenshots done");

import { expect, test } from "@playwright/test";

test("desktop header keeps the logo readable and mini-cart fully opaque", async ({ page }, testInfo) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1280, "Desktop-only layout regression");

  await page.goto("/produkty");
  const logo = page.getByRole("link", { name: /Templify.pl/i }).first().locator("img");
  await expect(logo).toBeVisible();
  expect((await logo.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(140);

  await page.getByRole("button", { name: /Dodaj do koszyka/i }).first().click();
  await page.getByRole("button", { name: "Otwórz koszyk" }).first().click();

  const cart = page.getByRole("dialog", { name: "Mini koszyk" });
  await expect(cart).toBeVisible();
  await page.waitForTimeout(450);
  const background = await cart.evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(background).not.toMatch(/rgba\([^)]*,\s*(0|0\.[0-9]+)\s*\)$/);
  expect((await cart.boundingBox())?.y).toBe(0);

  await page.screenshot({
    path: testInfo.outputPath("header-cart-desktop.png"),
    fullPage: false,
  });
});

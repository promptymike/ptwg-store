import { expect, test } from "@playwright/test";

test("homepage uses Templify favicon and includes planners in categories", async ({ page }) => {
  await page.goto("/");

  const faviconHref = await page.locator('link[rel="icon"]').first().getAttribute("href");
  expect(faviconHref).toContain("favicon.ico");
  await expect(page.getByRole("heading", { name: /Planery i template/i })).toBeVisible();

  const bundleCards = page.locator("#bundles article");
  expect(await bundleCards.count()).toBeGreaterThan(0);
  if ((page.viewportSize()?.width ?? 0) >= 1280 && (await bundleCards.count()) >= 3) {
    const rows = await bundleCards.evaluateAll((cards) =>
      cards.slice(0, 3).map((card) => Math.round(card.getBoundingClientRect().y)),
    );
    expect(new Set(rows).size).toBe(1);
  }
});

test("desktop header keeps the logo readable and mini-cart fully opaque", async ({ page }, testInfo) => {
  test.skip((page.viewportSize()?.width ?? 0) < 1280, "Desktop-only layout regression");

  await page.goto("/produkty");
  // Current brand lockup: small app icon (~36-40px) + "templify.pl" wordmark
  // rendered as text. Assert both halves are visible instead of the legacy
  // 140px-wide image logo.
  const brandLink = page.getByRole("link", { name: /Templify.pl/i }).first();
  await expect(brandLink).toBeVisible();
  const icon = brandLink.locator("img");
  await expect(icon).toBeVisible();
  expect((await icon.boundingBox())?.width ?? 0).toBeGreaterThanOrEqual(32);
  await expect(brandLink.getByText("templify")).toBeVisible();

  // Adding to cart auto-opens the mini-cart drawer — no header click needed.
  const addButton = page.getByRole("button", { name: /Dodaj do koszyka/i });
  if ((await addButton.count()) === 0) {
    await expect(
      page.getByRole("button", { name: "Zakupy chwilowo niedostępne" }).first(),
    ).toBeDisabled();
    return;
  }
  await addButton.first().click();

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

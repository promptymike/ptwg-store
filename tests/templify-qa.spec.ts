import {
  expect,
  type Locator,
  type Page,
  test,
  type TestInfo,
} from "@playwright/test";

type ConsoleIssue = {
  type: string;
  text: string;
};

type CartLine = {
  productId: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
  } | null;
};

const PRODUCT_CATEGORY_FILTERS = [
  "Planowanie i Notion",
  "Content i marketing",
  /Sprzeda/i,
  "Finanse i operacje",
  /Produktywno/i,
];

function collectConsoleIssues(page: Page) {
  const issues: ConsoleIssue[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push({ type: message.type(), text: message.text() });
    }
  });

  page.on("pageerror", (error) => {
    issues.push({ type: "pageerror", text: error.message });
  });

  return issues;
}

async function expectNoConsoleIssues(issues: ConsoleIssue[]) {
  expect(
    issues,
    issues.map((issue) => `${issue.type}: ${issue.text}`).join("\n"),
  ).toEqual([]);
}

async function attachConsoleIssues(testInfo: TestInfo, issues: ConsoleIssue[]) {
  if (issues.length === 0) {
    return;
  }

  await testInfo.attach("console-issues", {
    body: JSON.stringify(issues, null, 2),
    contentType: "application/json",
  });
}

async function expectNoHorizontalScroll(page: Page) {
  await page.waitForTimeout(100);

  const overflow = await page.evaluate(() => {
    const documentWidth = Math.ceil(document.documentElement.scrollWidth);
    const viewportWidth = Math.ceil(document.documentElement.clientWidth);
    const bodyWidth = Math.ceil(document.body.scrollWidth);

    return Math.max(documentWidth, bodyWidth) - viewportWidth;
  });

  expect.soft(overflow, `Horizontal overflow on ${page.url()}`).toBeLessThanOrEqual(1);
}

async function acceptCookiesIfVisible(page: Page) {
  const consentButton = page
    .getByRole("button", { name: /Akcept|Odrzuc/i })
    .first();

  if (await consentButton.isVisible().catch(() => false)) {
    try {
      await consentButton.click({ timeout: 3_000 });
      return "clicked";
    } catch {
      await consentButton.click({ force: true });
      return "forced";
    }
  }

  return "hidden";
}

async function openMobileMenuIfNeeded(page: Page, linkName: string | RegExp) {
  const banner = page.getByRole("banner");
  const link = banner.getByRole("link", { name: linkName }).first();

  if (await link.isVisible().catch(() => false)) {
    return;
  }

  const menuButton = page.getByRole("button", { name: /menu/i }).first();

  if (await menuButton.isVisible().catch(() => false)) {
    await menuButton.click();
  }
}

async function clickHeaderLink(
  page: Page,
  linkName: string | RegExp,
  expectedUrl: string | RegExp,
) {
  await page.goto("/");
  await acceptCookiesIfVisible(page);
  await openMobileMenuIfNeeded(page, linkName);
  await page
    .getByRole("banner")
    .getByRole("link", { name: linkName })
    .first()
    .click();
  await expect(page).toHaveURL(expectedUrl);
  await expectNoHorizontalScroll(page);
}

function productCards(page: Page) {
  return page
    .getByRole("article")
    .filter({ has: page.getByRole("button", { name: /Dodaj do koszyka/i }) });
}

async function firstProductCard(page: Page) {
  await page.goto("/produkty");
  await acceptCookiesIfVisible(page);

  const card = productCards(page).first();
  await expect(card).toBeVisible();
  return card;
}

async function openFirstProduct(page: Page) {
  const card = await firstProductCard(page);
  await card.getByRole("link", { name: /Zobacz produkt:/i }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoHorizontalScroll(page);

  return page.getByRole("heading", { level: 1 }).textContent();
}

async function addFirstProductToCart(page: Page) {
  const productName = await openFirstProduct(page);
  await page
    .getByRole("button", { name: /Dodaj do koszyka/i })
    .first()
    .click();

  await expect(
    page.getByRole("button", { name: /Dodano do koszyka/i }).first(),
  ).toBeVisible();

  return productName?.trim() ?? "";
}

async function readCart(page: Page) {
  return page.evaluate<CartLine[]>(() => {
    const rawCart = window.localStorage.getItem("ptwg.cart");
    return rawCart ? (JSON.parse(rawCart) as CartLine[]) : [];
  });
}

function formatPLN(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);
}

async function visibleBox(locator: Locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.height ?? 0).toBeGreaterThan(0);
  expect(box?.height ?? 0).toBeLessThan(260);
}

test.describe("Templify storefront QA", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (!window.sessionStorage.getItem("templify-qa-cart-cleared")) {
        window.localStorage.removeItem("ptwg.cart");
        window.sessionStorage.setItem("templify-qa-cart-cleared", "true");
      }
    });
  });

  test("homepage: cookie banner, header links, console and horizontal scroll", async ({
    page,
  }) => {
    const consoleIssues = collectConsoleIssues(page);

    await page.goto("/");
    const cookieResult = await acceptCookiesIfVisible(page);
    expect
      .soft(
        cookieResult,
        "Cookie banner primary action should be clickable without force",
      )
      .not.toBe("forced");
    await expect(page.getByRole("link", { name: /Templify/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page);

    await clickHeaderLink(page, "Produkty", /\/produkty$/);
    await clickHeaderLink(page, "Kategorie", /\/#use-cases$/);
    await clickHeaderLink(page, "Pakiety", /\/#bundles$/);
    await clickHeaderLink(page, "Test", /\/test$/);

    await expectNoConsoleIssues(consoleIssues);
  });

  test("produkty: renderowanie kart, filtry kategorii, CTA i brak poziomego scrolla", async ({
    page,
  }, testInfo) => {
    const consoleIssues = collectConsoleIssues(page);

    await page.goto("/produkty");
    await acceptCookiesIfVisible(page);

    const cards = productCards(page);
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);

    const firstCard = cards.first();
    await expect(firstCard.getByRole("heading").first()).toBeVisible();
    await expect(firstCard.getByText(/\d+\s*(zł|PLN)/i).first()).toBeVisible();
    await expect(
      firstCard.getByRole("button", { name: /Dodaj do koszyka/i }),
    ).toBeVisible();

    for (const filterName of PRODUCT_CATEGORY_FILTERS) {
      const filter = page.getByRole("link", { name: filterName }).first();

      if (await filter.isVisible().catch(() => false)) {
        await filter.click();
        await expect(page).toHaveURL(/\/produkty\?kategoria=/);
        await expect(cards.first()).toBeVisible();
        break;
      }
    }

    await expectNoHorizontalScroll(page);
    await attachConsoleIssues(testInfo, consoleIssues);
  });

  test("strona produktu: pierwszy produkt, dodanie do koszyka, trust cards i layout", async ({
    page,
  }, testInfo) => {
    const consoleIssues = collectConsoleIssues(page);

    const productName = await addFirstProductToCart(page);
    expect(productName.length).toBeGreaterThan(0);

    await visibleBox(page.getByText(/Natychmiastowy/i).first());
    await visibleBox(page.getByText(/14 dni/i).first());
    await visibleBox(page.getByText(/Licencja/i).first());

    const cart = await readCart(page);
    expect(cart).toHaveLength(1);
    expect(cart[0]?.product?.name).toBe(productName);

    await expectNoHorizontalScroll(page);
    await attachConsoleIssues(testInfo, consoleIssues);
  });

  test("koszyk: produkt, ilość, usuwanie, suma i szerokość strony", async ({
    page,
  }, testInfo) => {
    const consoleIssues = collectConsoleIssues(page);
    const productName = await addFirstProductToCart(page);

    await page.goto("/koszyk");
    await expect(page.getByText(productName).first()).toBeVisible();

    let cart = await readCart(page);
    const unitPrice = cart[0]?.product?.price ?? 0;
    expect(unitPrice).toBeGreaterThan(0);

    await expect(page.getByText(formatPLN(unitPrice)).first()).toBeVisible();
    await page.getByRole("button", { name: /Zwi/i }).click();

    cart = await readCart(page);
    expect(cart[0]?.quantity).toBe(2);
    await expect(page.getByText(formatPLN(unitPrice * 2)).first()).toBeVisible();

    await page.getByRole("button", { name: /Usu.*produkt/i }).click();
    await expect(page.getByText(/koszyk.*pusty/i).first()).toBeVisible();
    expect(await readCart(page)).toEqual([]);

    await expectNoHorizontalScroll(page);
    await attachConsoleIssues(testInfo, consoleIssues);
  });

  test("checkout: auth gate, health endpoint and safe Stripe status", async ({
    page,
    request,
  }, testInfo) => {
    const consoleIssues = collectConsoleIssues(page);

    const healthResponse = await request.get("/api/checkout/health");
    expect(healthResponse.ok()).toBeTruthy();

    const health = (await healthResponse.json()) as {
      ready: boolean;
      testMode: boolean;
      liveMode: boolean;
      missing?: string[];
      webhookConfigured: boolean;
    };

    testInfo.annotations.push({
      type: "checkout-health",
      description: JSON.stringify(health),
    });

    expect(health.liveMode, "Checkout must not run in live Stripe mode during QA").toBe(false);

    if (health.ready) {
      expect(health.testMode, "Configured checkout must use Stripe test mode").toBe(true);
    } else {
      expect(
        Array.isArray(health.missing) && health.missing.length > 0,
        "Blocked checkout should expose missing env vars in local/dev QA",
      ).toBe(true);
    }

    await page.goto("/checkout");
    await expect(
      page.getByRole("heading", { name: /Doko.*zakup|Checkout|Finalizacja/i }).first(),
    ).toBeVisible();
    await expectNoHorizontalScroll(page);
    await attachConsoleIssues(testInfo, consoleIssues);
  });

  test("konto, biblioteka i admin: niezalogowany user jest chroniony", async ({
    page,
  }, testInfo) => {
    const consoleIssues = collectConsoleIssues(page);

    await page.goto("/biblioteka");
    await expect(page).toHaveURL(/\/logowanie\?next=%2Fbiblioteka|\/logowanie\?next=\/biblioteka/);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expectNoHorizontalScroll(page);

    await page.goto("/konto");
    await expect(page).toHaveURL(/\/logowanie/);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expectNoHorizontalScroll(page);

    await page.goto("/admin");
    expect
      .soft(page.url(), "Admin should redirect anonymous users to login")
      .toMatch(/\/logowanie\?next=%2Fadmin|\/logowanie\?next=\/admin/);
    await expect(page.getByRole("heading").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Wyloguj|Logout/i })).toHaveCount(0);
    await expectNoHorizontalScroll(page);

    await attachConsoleIssues(testInfo, consoleIssues);
  });
});

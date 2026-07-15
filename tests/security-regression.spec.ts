import { expect, test } from "@playwright/test";

test("global security headers and auth redirects stay hardened", async ({
  request,
}) => {
  const home = await request.get("/");
  expect(home.ok()).toBeTruthy();
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home.headers()["x-frame-options"]).toBe("SAMEORIGIN");
  expect(home.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(home.headers()["permissions-policy"]).toContain("camera=()");
  expect(
    home.headers()["content-security-policy"] ??
      home.headers()["content-security-policy-report-only"],
  ).toContain("object-src 'none'");

  const redirect = await request.get(
    "/auth/callback?next=https%3A%2F%2Fevil.example%2Fsteal",
    { maxRedirects: 0 },
  );
  expect(redirect.status()).toBeGreaterThanOrEqual(300);
  expect(redirect.status()).toBeLessThan(400);
  expect(new URL(redirect.headers().location).pathname).toBe("/konto");
});

test("anonymous callers cannot reach privileged API operations", async ({
  request,
}) => {
  const upload = await request.post("/api/admin/uploads/sign", {
    data: {
      kind: "cover",
      fileName: "cover.png",
      fileSize: 100,
      contentType: "image/png",
    },
  });
  expect(upload.status()).toBe(403);

  const testerFeedback = await request.post("/api/tester-feedback", {
    data: {
      category: "bug",
      message: "Próba bez konta testera",
      pageUrl: "http://localhost:3000/",
    },
  });
  expect(testerFeedback.status()).toBe(403);

  const ai = await request.post("/api/planner-instances/planer-finansow/ai", {
    data: { messages: [{ role: "user", content: "test" }] },
  });
  expect(ai.status()).toBe(401);

  const ownedEmbed = await request.get(
    "/api/planners/planer-finansow/embed?mode=owned",
  );
  expect(ownedEmbed.status()).toBe(401);
});

test("planner demo is sandboxed and its route has a restrictive CSP", async ({
  page,
  request,
}) => {
  const embed = await request.get(
    "/api/planners/planer-finansow/embed?mode=demo",
  );
  expect(embed.ok()).toBeTruthy();
  const embedCsp = embed.headers()["content-security-policy"];
  expect(embedCsp).toContain("default-src 'none'");
  expect(embedCsp).toContain("connect-src http://localhost:3000");
  expect(embedCsp).not.toContain("openrouter.ai");

  const openGraphImage = await request.get(
    "/api/planners/planer-finansow/opengraph-image",
  );
  expect(openGraphImage.ok()).toBeTruthy();
  expect(openGraphImage.headers()["content-type"]).toContain("image/png");

  await page.goto("/planery/planer-finansow/demo");
  const iframe = page.locator("iframe");
  await expect(iframe).toHaveAttribute(
    "sandbox",
    "allow-scripts allow-forms allow-modals allow-downloads allow-popups",
  );
  await expect(
    page.frameLocator("iframe").getByText("Dashboard", { exact: true }).first(),
  ).toBeVisible();
});

test("all planner runtime libraries are served locally", async ({ request }) => {
  const assets = [
    "chart.umd.js",
    "Sortable.min.js",
    "dayjs.min.js",
    "dayjs-locale-pl.js",
    "dayjs-weekOfYear.js",
    "dayjs-customParseFormat.js",
    "dayjs-isBetween.js",
    "lucide.min.js",
    "leaflet.js",
    "leaflet.css",
    "images/marker-icon.png",
  ];

  for (const asset of assets) {
    const response = await request.get(`/api/planner-assets/${asset}`);
    expect(response.ok(), `${asset} should be bundled and served`).toBeTruthy();
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  }
});

test("HotPay review disclosures stay visible and checkout stays gated", async ({
  page,
}) => {
  await page.goto("/podarunek");
  await expect(
    page.getByText("Dostawa cyfrowa e-mailem", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Nie doliczono (zwolnienie)", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: /Akceptuję Regulamin/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Zakupy chwilowo niedostępne" }),
  ).toBeDisabled();

  await page.goto("/regulamin");
  await expect(
    page
      .getByText(
        /Rozliczenia transakcji e-przelewem przeprowadzane są za pośrednictwem HotPay/,
      )
      .first(),
  ).toBeVisible();
  await expect(
    page.getByText(/Dostawa wszystkich Produktów odbywa się wyłącznie cyfrowo/),
  ).toBeVisible();
  await expect(page.getByText("Gwarancja i odpowiedzialność ustawowa")).toBeVisible();
});

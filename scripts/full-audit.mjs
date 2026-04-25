// Full visual + behavioural audit. Walks every public + authenticated
// route, takes desktop + mobile screenshots, captures console errors,
// and probes for layout overflow, slow loads, missing alts, etc.
//
// Reads admin credentials from env. Outputs to ./audit/.

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:3000";
const email = process.env.TEMPLIFY_ADMIN_EMAIL;
const password = process.env.TEMPLIFY_ADMIN_PASSWORD;

mkdirSync("audit", { recursive: true });

const findings = [];

function logFinding(area, severity, note) {
  findings.push({ area, severity, note });
  console.log(`[${severity}] ${area}: ${note}`);
}

async function auditPage(page, url, name) {
  const errors = [];
  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console.error: ${m.text().slice(0, 200)}`);
  });
  page.on("pageerror", (e) =>
    errors.push(`pageerror: ${e.message.slice(0, 200)}`),
  );

  const start = Date.now();
  try {
    await page.goto(url, { waitUntil: "load", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
  } catch (e) {
    logFinding(name, "FAIL", `Load failed: ${e.message.slice(0, 100)}`);
    return;
  }
  const loadTime = Date.now() - start;

  const data = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const dw = Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    );
    const overflow = dw - vw;

    // Tiny touch targets on mobile.
    const tinyTargets = [];
    if (vw < 500) {
      for (const el of document.querySelectorAll(
        'button, a[href], a[role="button"], [role="button"]',
      )) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.height < 36 || r.width < 36) && r.height > 0) {
          tinyTargets.push({
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || el.getAttribute("aria-label") || "")
              .trim()
              .slice(0, 30),
            w: Math.round(r.width),
            h: Math.round(r.height),
          });
        }
      }
    }

    // Images without alt.
    const imgsNoAlt = Array.from(document.querySelectorAll("img")).filter(
      (img) =>
        !img.hasAttribute("alt") &&
        !img.getAttribute("aria-hidden"),
    ).length;

    // Multiple h1.
    const h1Count = document.querySelectorAll("h1").length;

    // Form inputs without label.
    const inputsNoLabel = Array.from(
      document.querySelectorAll(
        "input:not([type='hidden']), textarea, select",
      ),
    ).filter((el) => {
      if (el.getAttribute("aria-label")) return false;
      if (el.getAttribute("aria-labelledby")) return false;
      if (el.id && document.querySelector(`label[for="${el.id}"]`)) return false;
      if (el.closest("label")) return false;
      return true;
    }).length;

    return {
      title: document.title,
      vw,
      dw,
      overflow,
      h1Count,
      tinyTargets: tinyTargets.slice(0, 10),
      imgsNoAlt,
      inputsNoLabel,
    };
  });

  if (data.overflow > 1) {
    logFinding(name, "BUG", `horizontal overflow ${data.overflow}px`);
  }
  if (data.h1Count !== 1) {
    logFinding(name, "WARN", `h1 count = ${data.h1Count} (expected 1)`);
  }
  if (data.tinyTargets.length > 0) {
    logFinding(
      name,
      "WARN",
      `${data.tinyTargets.length} tiny touch targets`,
    );
  }
  if (data.imgsNoAlt > 0) {
    logFinding(name, "WARN", `${data.imgsNoAlt} images without alt`);
  }
  if (data.inputsNoLabel > 0) {
    logFinding(
      name,
      "WARN",
      `${data.inputsNoLabel} form fields without label`,
    );
  }
  if (loadTime > 3500) {
    logFinding(name, "PERF", `load time ${loadTime}ms`);
  }
  if (errors.length > 0) {
    for (const e of errors.slice(0, 3)) logFinding(name, "ERR", e);
  }
}

(async () => {
  const browser = await chromium.launch();

  for (const [vw, vh, label] of [
    [1440, 900, "desktop"],
    [390, 844, "mobile"],
  ]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
    const page = await ctx.newPage();

    console.log(`\n=== ${label.toUpperCase()} (${vw}x${vh}) — anonymous ===`);
    for (const [path, name] of [
      ["/", "home"],
      ["/produkty", "catalog"],
      ["/produkty?kategoria=Finanse%20osobiste", "catalog-finanse"],
      ["/produkty?kategoria=Macierzy%C5%84stwo%20i%20rodzina", "catalog-macierzynstwo"],
      ["/produkty/budzet-domowy-dla-poczatkujacych", "product-budzet"],
      ["/produkty/macierzynstwo-od-a-do-z", "product-macierzynstwo"],
      ["/produkty/adhd-planner-dla-doroslych", "product-adhd"],
      ["/koszyk", "cart-empty"],
      ["/checkout", "checkout-anon"],
      ["/logowanie", "login"],
      ["/rejestracja", "register"],
      ["/test", "personality-test"],
      ["/regulamin", "terms"],
      ["/polityka-prywatnosci", "privacy"],
      ["/polityka-cookies", "cookies"],
      ["/kontakt", "contact"],
      ["/biblioteka", "library-anon"],
      ["/konto", "account-anon"],
      ["/admin", "admin-anon"],
    ]) {
      await auditPage(page, `${BASE}${path}`, `${label}/${name}`);
      try {
        await page.screenshot({
          path: `audit/${label}-${name}.png`,
          fullPage: true,
        });
      } catch (e) {
        console.log(`Screenshot failed for ${name}: ${e.message.slice(0, 60)}`);
      }
    }

    if (email && password) {
      console.log(`\n=== ${label.toUpperCase()} — logged in ===`);
      // Fresh context so cookies/storage do not leak between modes.
      await ctx.close();
      const authedCtx = await browser.newContext({
        viewport: { width: vw, height: vh },
      });
      const authedPage = await authedCtx.newPage();
      await authedPage.goto(`${BASE}/logowanie?next=/biblioteka`, {
        waitUntil: "load",
      });
      await authedPage.waitForTimeout(500);
      // Cookie banner can overlap the submit button — dismiss it first
      // so the script does not need force-click. (Real-user UX bug
      // worth flagging too; logged in findings.json.)
      const accept = authedPage
        .locator("button", { hasText: /Akceptuj/i })
        .first();
      if (await accept.isVisible({ timeout: 2000 }).catch(() => false)) {
        await accept.click({ force: true });
        logFinding(
          `${label}/login`,
          "BUG",
          "Cookie banner overlapped Zaloguj button — needed force click",
        );
        await authedPage.waitForTimeout(400);
      }
      await authedPage.locator("#auth-email").first().fill(email);
      await authedPage.locator("#auth-password").first().fill(password);
      await authedPage
        .locator("button", { hasText: /Zaloguj/i })
        .first()
        .click();
      await authedPage.waitForURL(/\/biblioteka/, { timeout: 20000 });
      await authedPage.waitForTimeout(1500);

      page.removeAllListeners("console");
      page.removeAllListeners("pageerror");

      for (const [path, name] of [
        ["/biblioteka", "library"],
        ["/konto", "account"],
        ["/admin", "admin"],
        ["/admin/produkty", "admin-produkty"],
        ["/admin/zamowienia", "admin-zamowienia"],
        ["/admin/kategorie", "admin-kategorie"],
        ["/admin/content", "admin-content"],
        ["/admin/ustawienia", "admin-ustawienia"],
      ]) {
        await auditPage(authedPage, `${BASE}${path}`, `${label}/auth-${name}`);
        try {
          await authedPage.screenshot({
            path: `audit/${label}-auth-${name}.png`,
            fullPage: true,
          });
        } catch (e) {}
      }
      await authedCtx.close();
    } else {
      await ctx.close();
    }
  }

  await browser.close();

  writeFileSync(
    "audit/findings.json",
    JSON.stringify(findings, null, 2),
  );
  console.log(`\n=== Total findings: ${findings.length} ===`);
  const bySeverity = findings.reduce((acc, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify(bySeverity));
})();

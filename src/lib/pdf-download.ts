type PdfMargin = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};

const PDF_MARGIN: PdfMargin = {
  top: "16mm",
  right: "14mm",
  bottom: "18mm",
  left: "14mm",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeCssString(value: string) {
  return JSON.stringify(value);
}

function buildPrintStyles(title: string) {
  return `
    <style data-templify-pdf="true">
      @page { size: A4; margin: 16mm 14mm 18mm; }
      html, body {
        background: #fffaf3 !important;
        color: #17130f !important;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        line-height: 1.62 !important;
      }
      body {
        max-width: 760px;
        margin: 0 auto !important;
        padding: 0 !important;
      }
      body::before {
        content: ${escapeCssString(title)};
        display: block;
        margin: 0 0 18px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(23, 19, 15, 0.14);
        color: rgba(23, 19, 15, 0.52);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      img, svg, video, canvas {
        max-width: 100% !important;
        height: auto !important;
        page-break-inside: avoid;
      }
      h1, h2, h3, h4 {
        color: #17130f !important;
        page-break-after: avoid;
      }
      p, li {
        orphans: 3;
        widows: 3;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        page-break-inside: avoid;
      }
      a {
        color: inherit !important;
        text-decoration: underline;
      }
      .templify-reader-shell,
      .templify-reader-toggle,
      .templify-reader-panel,
      [data-templify-reader],
      button,
      nav {
        display: none !important;
      }
    </style>
  `;
}

function prepareHtmlForPdf(rawHtml: string, title: string) {
  const printStyles = buildPrintStyles(title);
  const hasHead = /<head(\s[^>]*)?>/i.test(rawHtml);
  const withTitle = rawHtml.replace(
    /<title[^>]*>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(title)}</title>`,
  );

  if (withTitle.includes(printStyles)) {
    return withTitle;
  }

  if (hasHead) {
    return withTitle.replace(
      /<\/head\s*>/i,
      `${printStyles}</head>`,
    );
  }

  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><title>${escapeHtml(
    title,
  )}</title>${printStyles}</head><body>${withTitle}</body></html>`;
}

async function renderWithPlaywright(html: string) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    await page.setContent(html, { waitUntil: "networkidle", timeout: 30_000 });
    const pdf = await page.pdf({
      format: "A4",
      margin: PDF_MARGIN,
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

async function renderWithChromium(html: string) {
  const [{ default: chromium }, puppeteer] = await Promise.all([
    import("@sparticuz/chromium"),
    import("puppeteer-core"),
  ]);
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30_000 });
    await page.waitForNetworkIdle({ timeout: 5_000 }).catch(() => undefined);
    const pdf = await page.pdf({
      format: "A4",
      margin: PDF_MARGIN,
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export async function renderEbookHtmlToPdfBuffer(
  rawHtml: string,
  productName: string,
) {
  const html = prepareHtmlForPdf(rawHtml, productName || "Templify");

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return renderWithChromium(html);
  }

  try {
    return await renderWithPlaywright(html);
  } catch {
    return renderWithChromium(html);
  }
}

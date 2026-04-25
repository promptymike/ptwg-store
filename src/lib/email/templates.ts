import { formatCurrency } from "@/lib/format";

type EmailItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
};

type OrderConfirmationInput = {
  customerName?: string | null;
  email: string;
  orderNumber: string;
  items: EmailItem[];
  subtotal: number;
  total: number;
  invoiceUrl?: string | null;
  receiptUrl?: string | null;
  libraryUrl: string;
};

type LibraryReadyInput = {
  customerName?: string | null;
  email: string;
  items: Array<{
    productName: string;
    productUrl: string;
    readUrl: string;
  }>;
  libraryUrl: string;
};

const ACCENT = "#b9763a";
const BG = "#faf6f0";
const PANEL = "#ffffff";
const TEXT = "#1a1612";
const MUTED = "#6b6256";
const BORDER = "#e9e1d4";

function wrap(title: string, body: string) {
  return `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>${escape(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${TEXT};line-height:1.55;">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">${escape(title)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PANEL};border-radius:18px;border:1px solid ${BORDER};overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid ${BORDER};">
                <a href="https://templify.pl" style="text-decoration:none;color:${TEXT};display:inline-flex;align-items:center;gap:12px;">
                  <span style="display:inline-block;width:32px;height:32px;border-radius:999px;background:${ACCENT};color:#fff;text-align:center;line-height:32px;font-weight:700;">T</span>
                  <span style="font-size:18px;font-weight:600;letter-spacing:-0.2px;">Templify</span>
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 8px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;">
                Templify — praktyczne ebooki i planery dla codziennego życia.<br/>
                Masz pytania? Napisz na <a href="mailto:kontakt@templify.store" style="color:${ACCENT};text-decoration:none;">kontakt@templify.store</a>.<br/>
                <span style="color:#9a8e7c;">Ten e-mail dotyczy Twojego zamówienia w sklepie templify.pl.</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function button(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:${ACCENT};color:#fff;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:0.2px;">${escape(label)}</a>`;
}

function ghostLink(label: string, href: string) {
  return `<a href="${href}" style="color:${ACCENT};text-decoration:none;font-weight:600;">${escape(label)} →</a>`;
}

function itemsTable(items: EmailItem[]) {
  const rows = items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;">${escape(item.productName)}${item.quantity > 1 ? ` <span style="color:${MUTED};">× ${item.quantity}</span>` : ""}</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;">${escape(formatCurrency(item.unitPrice * item.quantity))}</td>
      </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 12px;">${rows}</table>`;
}

function totalsBlock(subtotal: number, total: number) {
  const tax = total - subtotal;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
    ${
      tax > 0
        ? `<tr>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};">Suma netto</td>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};text-align:right;font-variant-numeric:tabular-nums;">${escape(formatCurrency(subtotal))}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};">VAT</td>
        <td style="padding:4px 0;font-size:13px;color:${MUTED};text-align:right;font-variant-numeric:tabular-nums;">${escape(formatCurrency(tax))}</td>
      </tr>`
        : ""
    }
    <tr>
      <td style="padding:8px 0 4px;font-size:15px;font-weight:600;">Łącznie do zapłaty</td>
      <td style="padding:8px 0 4px;font-size:15px;font-weight:600;text-align:right;font-variant-numeric:tabular-nums;">${escape(formatCurrency(total))}</td>
    </tr>
  </table>`;
}

export function renderOrderConfirmationEmail(input: OrderConfirmationInput) {
  const greeting = input.customerName
    ? `Cześć ${escape(input.customerName.split(/\s+/)[0])},`
    : "Cześć,";

  const html = wrap(
    `Potwierdzenie zamówienia ${input.orderNumber}`,
    `
      <p style="font-size:16px;margin:0 0 12px;">${greeting}</p>
      <p style="font-size:15px;margin:0 0 16px;color:${MUTED};">
        Dziękujemy za zakup w Templify. Twoje zamówienie ${escape(input.orderNumber)} jest opłacone, a pliki są już w bibliotece.
      </p>

      <div style="margin:20px 0 12px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${ACCENT};">Co kupiłeś</div>
      ${itemsTable(input.items)}
      ${totalsBlock(input.subtotal, input.total)}

      <div style="margin:24px 0 8px;">
        ${button("Otwórz bibliotekę", input.libraryUrl)}
      </div>

      ${
        input.invoiceUrl || input.receiptUrl
          ? `<p style="margin:16px 0 0;font-size:13px;color:${MUTED};">
              ${input.invoiceUrl ? ghostLink("Faktura VAT (PDF)", input.invoiceUrl) : ""}
              ${input.invoiceUrl && input.receiptUrl ? " &nbsp;·&nbsp; " : ""}
              ${input.receiptUrl ? ghostLink("Potwierdzenie płatności", input.receiptUrl) : ""}
            </p>`
          : ""
      }

      <p style="margin:24px 0 0;font-size:13px;color:${MUTED};">
        Masz 14 dni na zwrot bez podania przyczyny — wystarczy odpowiedzieć na tego maila.
      </p>
    `,
  );

  const text = `Cześć${input.customerName ? " " + input.customerName.split(/\s+/)[0] : ""},

Dziękujemy za zakup w Templify.
Numer zamówienia: ${input.orderNumber}

Co kupiłeś:
${input.items.map((item) => `- ${item.productName}${item.quantity > 1 ? ` × ${item.quantity}` : ""} — ${formatCurrency(item.unitPrice * item.quantity)}`).join("\n")}

Łącznie: ${formatCurrency(input.total)}

Otwórz bibliotekę: ${input.libraryUrl}
${input.invoiceUrl ? `\nFaktura VAT: ${input.invoiceUrl}` : ""}${input.receiptUrl ? `\nPotwierdzenie płatności: ${input.receiptUrl}` : ""}

Masz 14 dni na zwrot — odpowiedz na tego maila.

Templify
kontakt@templify.store
`;

  return { html, text, subject: `Zamówienie ${input.orderNumber} — potwierdzone` };
}

export function renderLibraryReadyEmail(input: LibraryReadyInput) {
  const greeting = input.customerName
    ? `Cześć ${escape(input.customerName.split(/\s+/)[0])},`
    : "Cześć,";

  const itemsHtml = input.items
    .map(
      (item) => `<tr>
        <td style="padding:14px 0;border-bottom:1px solid ${BORDER};">
          <div style="font-size:15px;font-weight:600;color:${TEXT};">${escape(item.productName)}</div>
          <div style="margin-top:6px;font-size:13px;">
            <a href="${item.readUrl}" style="color:${ACCENT};text-decoration:none;font-weight:600;">Czytaj w przeglądarce →</a>
          </div>
        </td>
      </tr>`,
    )
    .join("");

  const html = wrap(
    "Twoje pliki są gotowe",
    `
      <p style="font-size:16px;margin:0 0 12px;">${greeting}</p>
      <p style="font-size:15px;margin:0 0 16px;color:${MUTED};">
        Wszystkie kupione pozycje są już w Twojej bibliotece. Otwierasz je jednym kliknięciem — działa na telefonie i komputerze.
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px;">${itemsHtml}</table>

      <div style="margin:24px 0 8px;">
        ${button("Otwórz bibliotekę", input.libraryUrl)}
      </div>

      <p style="margin:18px 0 0;font-size:13px;color:${MUTED};">
        Twój postęp czytania zapisuje się automatycznie — wracasz dokładnie tam, gdzie skończyłeś. W bibliotece możesz też dodawać zakładki i zmieniać motyw lub rozmiar tekstu.
      </p>
    `,
  );

  const text = `Cześć${input.customerName ? " " + input.customerName.split(/\s+/)[0] : ""},

Twoje pliki są już dostępne w bibliotece Templify.

${input.items.map((item) => `- ${item.productName}\n  Czytaj: ${item.readUrl}`).join("\n\n")}

Otwórz bibliotekę: ${input.libraryUrl}

Templify
kontakt@templify.store
`;

  return { html, text, subject: "Twoje ebooki są gotowe do czytania" };
}

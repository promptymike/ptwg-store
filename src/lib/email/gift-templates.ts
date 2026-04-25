// Voucher emails — sent from /api/stripe/webhook → fulfillGiftPurchase.
// Two templates: confirmation for the buyer and the actual gift card for
// the recipient (when the buyer chose to send it directly).

const ACCENT = "#b9763a";
const TEXT = "#1a1612";
const MUTED = "#6b6256";
const BORDER = "#e9e1d4";
const PANEL = "#ffffff";
const BG = "#faf6f0";

function escape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function header() {
  return `<tr><td style="padding:28px 32px;border-bottom:1px solid ${BORDER};">
<a href="https://templify.pl" style="text-decoration:none;color:${TEXT};display:inline-flex;align-items:center;gap:12px;">
<span style="display:inline-block;width:32px;height:32px;border-radius:999px;background:${ACCENT};color:#fff;text-align:center;line-height:32px;font-weight:700;">T</span>
<span style="font-size:18px;font-weight:600;letter-spacing:-0.2px;">Templify</span></a>
</td></tr>`;
}

function footer(audience: "purchaser" | "recipient") {
  const reason =
    audience === "purchaser"
      ? "Dostajesz tę wiadomość, bo kupiłaś/eś voucher Templify."
      : "Dostajesz tę wiadomość, bo ktoś podarował Ci voucher Templify.";
  return `<tr><td style="padding:24px 32px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;">
${reason}<br/>
W razie pytań — odpisz na tego maila albo napisz na kontakt@templify.store.
</td></tr>`;
}

function codeBlock(code: string, amountLabel: string) {
  return `<div style="margin:24px 0;padding:24px;border:1px dashed ${ACCENT};border-radius:14px;background:#fff8ec;text-align:center;">
    <p style="margin:0 0 6px;font-size:13px;color:${MUTED};text-transform:uppercase;letter-spacing:2px;">Twój kod (${escape(amountLabel)})</p>
    <p style="margin:0;font-size:24px;font-weight:700;letter-spacing:3px;color:${ACCENT};font-family:'SFMono-Regular',Menlo,Monaco,Consolas,monospace;">${escape(code)}</p>
  </div>`;
}

function ctaButton(label: string, href: string) {
  return `<p style="margin:18px 0;text-align:center;">
    <a href="${href}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:${ACCENT};color:#fff;text-decoration:none;font-weight:600;font-size:15px;">${escape(label)}</a>
  </p>`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" }).format(value);
}

export type PurchaserEmailInput = {
  code: string;
  amountLabel: string;
  recipientEmail: string | null;
  expiresAt: Date;
  cartUrl: string;
};

export function renderGiftCodePurchaserEmail(input: PurchaserEmailInput) {
  const subject = `Voucher Templify ${input.amountLabel} — kod gotowy`;
  const recipientLine = input.recipientEmail
    ? `<p style="margin:0 0 12px;font-size:14px;color:${MUTED};">Drugi mail z tym samym kodem trafił też do <strong>${escape(input.recipientEmail)}</strong>. Kod ważny do <strong>${escape(formatDate(input.expiresAt))}</strong>.</p>`
    : `<p style="margin:0 0 12px;font-size:14px;color:${MUTED};">Kod ważny do <strong>${escape(formatDate(input.expiresAt))}</strong>. Wpisuje się go w polu „Mam kod” w koszyku.</p>`;

  const html = `<!doctype html>
<html lang="pl"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" /><title>${escape(subject)}</title>
</head><body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXT};line-height:1.55;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PANEL};border-radius:18px;border:1px solid ${BORDER};overflow:hidden;">
${header()}
<tr><td style="padding:28px 32px 8px;">
<h1 style="margin:0 0 12px;font-size:24px;letter-spacing:-0.3px;">Voucher gotowy.</h1>
<p style="margin:0 0 12px;font-size:15px;">Dziękujemy za zakup. Poniżej znajdziesz unikalny kod, który możesz przekazać dalej albo wykorzystać sama/sam przy najbliższym zamówieniu.</p>
${codeBlock(input.code, input.amountLabel)}
${recipientLine}
${ctaButton("Wykorzystaj w sklepie", input.cartUrl)}
<p style="margin:24px 0 0;font-size:13px;color:${MUTED};">Voucher to dokument finansowy — przechowuj kod w bezpiecznym miejscu. Nie wystawiamy duplikatów po wykorzystaniu.</p>
</td></tr>
${footer("purchaser")}
</table></td></tr></table></body></html>`;

  const text = `Voucher ${input.amountLabel} gotowy.

Twój kod: ${input.code}
Ważny do: ${formatDate(input.expiresAt)}

${input.recipientEmail ? `Drugi mail z kodem trafił też do ${input.recipientEmail}.\n\n` : ""}Wykorzystaj w sklepie: ${input.cartUrl}

Templify
kontakt@templify.store`;

  return { subject, html, text };
}

export type RecipientEmailInput = {
  code: string;
  amountLabel: string;
  recipientName: string | null;
  message: string | null;
  cartUrl: string;
  expiresAt: Date;
};

export function renderGiftCodeRecipientEmail(input: RecipientEmailInput) {
  const greeting = input.recipientName
    ? `Cześć ${escape(input.recipientName)}!`
    : "Cześć!";
  const messageBlock = input.message
    ? `<blockquote style="margin:18px 0;padding:14px 18px;border-left:4px solid ${ACCENT};background:#fff8ec;color:${TEXT};font-style:italic;font-size:15px;">${escape(input.message)}</blockquote>`
    : "";

  const subject = `Masz voucher Templify (${input.amountLabel}) do wykorzystania`;
  const html = `<!doctype html>
<html lang="pl"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" /><title>${escape(subject)}</title>
</head><body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXT};line-height:1.55;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PANEL};border-radius:18px;border:1px solid ${BORDER};overflow:hidden;">
${header()}
<tr><td style="padding:28px 32px 8px;">
<h1 style="margin:0 0 12px;font-size:24px;letter-spacing:-0.3px;">${greeting}</h1>
<p style="margin:0 0 12px;font-size:15px;">Ktoś pomyślał o Tobie i podarował Ci voucher Templify do wykorzystania na dowolny ebook lub pakiet w sklepie.</p>
${messageBlock}
${codeBlock(input.code, input.amountLabel)}
<p style="margin:0 0 12px;font-size:14px;color:${MUTED};">Wystarczy wybrać produkty, w koszyku wpisać kod w polu „Mam kod” i potwierdzić — kwota odejmuje się od zamówienia. Ważny do <strong>${escape(formatDate(input.expiresAt))}</strong>.</p>
${ctaButton("Otwórz sklep", input.cartUrl)}
</td></tr>
${footer("recipient")}
</table></td></tr></table></body></html>`;

  const text = `${greeting}

Ktoś podarował Ci voucher Templify ${input.amountLabel}.

${input.message ? `Wiadomość: ${input.message}\n\n` : ""}Twój kod: ${input.code}
Ważny do: ${formatDate(input.expiresAt)}

Otwórz sklep: ${input.cartUrl}

Templify
kontakt@templify.store`;

  return { subject, html, text };
}

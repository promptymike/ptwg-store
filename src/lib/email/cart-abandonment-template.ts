// Cart abandonment recovery email — fired by /api/cron/cart-abandonment
// when a user kicked off checkout 24-48h ago but never completed payment.

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

export type CartAbandonmentInput = {
  cartUrl: string;
  promoCode?: string;
  percentOff?: number;
};

export function renderCartAbandonmentEmail(input: CartAbandonmentInput) {
  const promoBlock =
    input.promoCode && input.percentOff
      ? `<div style="margin:20px 0;padding:18px;border:1px dashed ${ACCENT};border-radius:14px;background:#fff8ec;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;color:${MUTED};text-transform:uppercase;letter-spacing:2px;">Twój kod</p>
          <p style="margin:0 0 6px;font-size:28px;font-weight:700;letter-spacing:2px;color:${ACCENT};">${escape(input.promoCode)}</p>
          <p style="margin:0;font-size:13px;color:${MUTED};">−${input.percentOff}% przy finalizacji koszyka, ważny 48h.</p>
        </div>`
      : "";

  const subject = "Zostawiłaś coś w koszyku — zachowamy go dla Ciebie";
  const html = `<!doctype html>
<html lang="pl"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" /><title>${escape(subject)}</title>
</head><body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXT};line-height:1.55;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PANEL};border-radius:18px;border:1px solid ${BORDER};overflow:hidden;">
<tr><td style="padding:28px 32px;border-bottom:1px solid ${BORDER};">
<a href="https://templify.pl" style="text-decoration:none;color:${TEXT};display:inline-flex;align-items:center;gap:12px;">
<span style="display:inline-block;width:32px;height:32px;border-radius:999px;background:${ACCENT};color:#fff;text-align:center;line-height:32px;font-weight:700;">T</span>
<span style="font-size:18px;font-weight:600;letter-spacing:-0.2px;">Templify</span></a>
</td></tr>
<tr><td style="padding:28px 32px 8px;">
<h1 style="margin:0 0 12px;font-size:24px;letter-spacing:-0.3px;">Twój koszyk czeka.</h1>
<p style="margin:0 0 12px;font-size:15px;">Zaczęłaś/eś składać zamówienie wczoraj — wracamy z przypomnieniem, że produkty wciąż są zapisane. Wystarczy jedno kliknięcie i kupujesz to, co już wybrałaś/eś.</p>
${promoBlock}
<p style="margin:18px 0;text-align:center;">
  <a href="${input.cartUrl}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:${ACCENT};color:#fff;text-decoration:none;font-weight:600;font-size:15px;">Wróć do koszyka</a>
</p>
<p style="margin:24px 0 0;font-size:13px;color:${MUTED};">Jeśli zmieniłaś/eś zdanie — bez nacisków. To ostatnie przypomnienie z naszej strony.</p>
</td></tr>
<tr><td style="padding:24px 32px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;">
Dostajesz tę wiadomość, bo zacząłeś/aś checkout w sklepie Templify.<br/>
Jeśli to nie ma sensu — odpowiedz „STOP", a wyłączymy te przypomnienia dla Twojego konta.
</td></tr></table></td></tr></table></body></html>`;

  const text = `Twój koszyk czeka — produkty są zapisane.

${input.promoCode ? `Kod ${input.promoCode} — −${input.percentOff}% przy finalizacji, ważny 48h.\n\n` : ""}Wróć do koszyka: ${input.cartUrl}

Templify
kontakt@templify.store`;

  return { subject, html, text };
}

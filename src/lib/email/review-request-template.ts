// Review request email — fired by /api/cron/review-requests 5 days after
// the buyer was granted access. We only ask once per product per buyer.

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

export type ReviewRequestInput = {
  productName: string;
  productUrl: string;
  reviewUrl: string;
};

export function renderReviewRequestEmail(input: ReviewRequestInput) {
  const subject = `Jak Ci się czyta „${input.productName}"?`;
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
<h1 style="margin:0 0 12px;font-size:24px;letter-spacing:-0.3px;">Jak Ci się czyta?</h1>
<p style="margin:0 0 12px;font-size:15px;">Minął tydzień, odkąd dostałaś/eś dostęp do <strong>${escape(input.productName)}</strong>. Jeśli zdążyłaś/eś zajrzeć — będziemy wdzięczni za 30 sekund Twojego czasu.</p>
<p style="margin:0 0 18px;font-size:15px;">Jedna ocena (1–5) i krótki komentarz pomagają innym kupującym podjąć decyzję, a nam — wiedzieć, co wyszło, a co poprawić w kolejnym wydaniu.</p>
<p style="margin:18px 0;text-align:center;">
  <a href="${input.reviewUrl}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:${ACCENT};color:#fff;text-decoration:none;font-weight:600;font-size:15px;">Wystaw opinię</a>
</p>
<p style="margin:24px 0 0;font-size:13px;color:${MUTED};">Nie miałaś/eś jeszcze okazji przeczytać? Spokojnie — wracaj do biblioteki w swoim tempie. Twój dostęp nie wygasa.</p>
</td></tr>
<tr><td style="padding:24px 32px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;">
Dostajesz tę wiadomość, bo kupiłaś/eś produkt w sklepie Templify.<br/>
Jeśli wolisz nie dostawać próśb o opinie — odpowiedz „NIE", wyłączymy dla Twojego konta.
</td></tr></table></td></tr></table></body></html>`;

  const text = `Jak Ci się czyta „${input.productName}"?

Minął tydzień od zakupu. Jeśli zdążyłaś/eś zajrzeć, prosimy o krótką opinię (1-5):
${input.reviewUrl}

Produkt: ${input.productUrl}

Templify
kontakt@templify.store`;

  return { subject, html, text };
}

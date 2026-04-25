// Drip campaign templates fired by /api/cron/newsletter-drip on a daily
// schedule. Day 0 ("welcome") is sent inline by the subscribe action;
// these handle day 3 + day 7 follow-ups.

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

function wrap(title: string, body: string) {
  return `<!doctype html>
<html lang="pl"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" /><title>${escape(title)}</title>
</head><body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXT};line-height:1.55;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PANEL};border-radius:18px;border:1px solid ${BORDER};overflow:hidden;">
<tr><td style="padding:28px 32px;border-bottom:1px solid ${BORDER};">
<a href="https://templify.pl" style="text-decoration:none;color:${TEXT};display:inline-flex;align-items:center;gap:12px;">
<span style="display:inline-block;width:32px;height:32px;border-radius:999px;background:${ACCENT};color:#fff;text-align:center;line-height:32px;font-weight:700;">T</span>
<span style="font-size:18px;font-weight:600;letter-spacing:-0.2px;">Templify</span></a>
</td></tr>
<tr><td style="padding:28px 32px 8px;">${body}</td></tr>
<tr><td style="padding:24px 32px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;">
Dostajesz tę wiadomość, bo zapisałaś/eś się na newsletter Templify.<br/>
Nie chcesz więcej? Odpowiedz „WYPISZ" — wykreślimy Cię w 24h.
</td></tr></table></td></tr></table></body></html>`;
}

export type DripTipInput = {
  sampleUrl?: string;
  sampleTitle?: string;
};

export function renderDripTipEmail(input: DripTipInput = {}) {
  const sampleBlock = input.sampleUrl
    ? `<div style="margin:24px 0 8px;padding:18px;border:1px solid ${BORDER};border-radius:14px;background:#fff8ec;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:${TEXT};">${escape(input.sampleTitle ?? "Bezpłatna próbka")}</p>
        <p style="margin:0 0 12px;color:${MUTED};font-size:13px;">Otwórz w przeglądarce — 5 minut wystarczy, żeby ocenić styl.</p>
        <a href="${input.sampleUrl}" style="display:inline-block;padding:11px 18px;border-radius:999px;background:${ACCENT};color:#fff;text-decoration:none;font-weight:600;font-size:14px;">Zobacz próbkę</a>
      </div>`
    : "";

  const html = wrap(
    "1 prosta zasada budżetu, która zmienia wszystko",
    `
      <h1 style="margin:0 0 12px;font-size:24px;letter-spacing:-0.3px;">90 sekund, jedna zasada.</h1>
      <p style="margin:0 0 12px;font-size:15px;">Cześć, jest zasada „24h" — przed każdym zakupem powyżej 100 zł odczekaj dobę. Jeśli następnego dnia jeszcze tego chcesz, kup. Jeśli już nie chcesz, masz oszczędność.</p>
      <p style="margin:0 0 12px;font-size:15px;">Brzmi banalnie, ale działa: 70% impulsywnych zakupów odchodzi w nocy. To samo, czy chodzi o nową rzecz w salonie, kurs online albo subskrypcję.</p>
      <p style="margin:0 0 12px;font-size:15px;">Pełniejszy system z konkretnymi kategoriami, kopertami i poduszką finansową znajdziesz w naszym <strong>Budżecie Domowym dla Początkujących</strong> — krótkie, zero teorii, działa w 1-2 wieczory.</p>
      ${sampleBlock}
      <p style="margin:24px 0 0;font-size:13px;color:${MUTED};">Jutro / pojutrze przyślemy ofertę startową dla nowych zapisów. Z naszej strony tylko praktyczne treści — nigdy spam.</p>
    `,
  );

  const text = `90 sekund, jedna zasada — przed zakupem powyżej 100 zł odczekaj dobę. Jeśli nadal chcesz, kup. Jeśli nie, oszczędziłeś.

Pełny system w "Budżet Domowy dla Początkujących" — krótkie, działa w 1-2 wieczory.

${input.sampleUrl ? `Bezpłatna próbka: ${input.sampleUrl}\n\n` : ""}Templify
kontakt@templify.store`;

  return {
    subject: "1 prosta zasada budżetu, która zmienia wszystko",
    html,
    text,
  };
}

export type DripOfferInput = {
  promoCode: string;
  percentOff: number;
  productsUrl: string;
};

export function renderDripOfferEmail(input: DripOfferInput) {
  const html = wrap(
    `Tylko dla Ciebie: -${input.percentOff}% na pierwszy ebook`,
    `
      <h1 style="margin:0 0 12px;font-size:24px;letter-spacing:-0.3px;">Nadszedł czas, żeby coś dla siebie wybrać.</h1>
      <p style="margin:0 0 12px;font-size:15px;">Jesteś z nami od tygodnia — dzięki. Mamy dla Ciebie <strong>${input.percentOff}%</strong> zniżki na pierwszy zakup w sklepie. Działa na wszystkie ebooki i pakiety.</p>
      <div style="margin:24px 0;padding:18px;border:1px solid ${BORDER};border-radius:14px;background:#fff8ec;text-align:center;">
        <p style="margin:0 0 6px;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:${MUTED};">Twój kod</p>
        <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:6px;color:${TEXT};">${escape(input.promoCode)}</p>
        <p style="margin:8px 0 16px;font-size:13px;color:${MUTED};">Wpisz w koszyku przed zakupem.</p>
        <a href="${input.productsUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:${ACCENT};color:#fff;text-decoration:none;font-weight:600;font-size:14px;">Otwórz katalog</a>
      </div>
      <p style="margin:0 0 8px;font-size:14px;font-weight:600;">Co warto wziąć na start:</p>
      <ul style="margin:0 0 16px;padding-left:18px;color:${MUTED};font-size:14px;line-height:1.8;">
        <li>Najtańszy ebook z kategorii, która Cię najbardziej dotyczy (test po lewej)</li>
        <li>Pakiet 2-3 ebooków — średnio -25% w stosunku do pojedynczych zakupów</li>
        <li>Każdy produkt ma 14 dni na zwrot bez podania przyczyny</li>
      </ul>
      <p style="margin:24px 0 0;font-size:13px;color:${MUTED};">Kod ważny przez 7 dni. Bez „kruczków". Bez auto-odnowienia.</p>
    `,
  );

  const text = `Twój kod: ${input.promoCode} (-${input.percentOff}% na pierwszy zakup, ważny 7 dni)

Otwórz katalog: ${input.productsUrl}

Templify
kontakt@templify.store`;

  return {
    subject: `Tylko dla Ciebie: -${input.percentOff}% na pierwszy ebook`,
    html,
    text,
  };
}

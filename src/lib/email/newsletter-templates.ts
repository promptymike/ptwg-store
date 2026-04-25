// Welcome email rendered after a newsletter subscription. Single template
// kept here so we can iterate on copy without touching the route handler
// or the Resend client wrapper.

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
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <title>${escape(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:${TEXT};line-height:1.55;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PANEL};border-radius:18px;border:1px solid ${BORDER};overflow:hidden;">
          <tr><td style="padding:28px 32px;border-bottom:1px solid ${BORDER};">
            <a href="https://templify.pl" style="text-decoration:none;color:${TEXT};display:inline-flex;align-items:center;gap:12px;">
              <span style="display:inline-block;width:32px;height:32px;border-radius:999px;background:${ACCENT};color:#fff;text-align:center;line-height:32px;font-weight:700;">T</span>
              <span style="font-size:18px;font-weight:600;letter-spacing:-0.2px;">Templify</span>
            </a>
          </td></tr>
          <tr><td style="padding:28px 32px 8px;">${body}</td></tr>
          <tr><td style="padding:24px 32px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;">
            Dostajesz tę wiadomość, bo zapisałaś/eś się na newsletter Templify.<br/>
            Nie chcesz więcej? Odpowiedz „WYPISZ" i wykreślimy Cię w 24h.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

type WelcomeInput = {
  /** Optional sample preview deep link to surface as a "spróbuj próbkę" CTA. */
  sampleUrl?: string;
  sampleTitle?: string;
};

export function renderNewsletterWelcomeEmail(input: WelcomeInput = {}) {
  const sampleBlock = input.sampleUrl
    ? `<div style="margin:24px 0 8px;padding:18px;border:1px solid ${BORDER};border-radius:14px;background:#fff8ec;">
        <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:${TEXT};">Na początek — bezpłatna próbka</p>
        <p style="margin:0 0 12px;color:${MUTED};font-size:13px;">${escape(input.sampleTitle ?? "Pierwsze strony jednego z naszych ebooków")} — żebyś wiedziała/eś czego się spodziewać.</p>
        <a href="${input.sampleUrl}" style="display:inline-block;padding:11px 18px;border-radius:999px;background:${ACCENT};color:#fff;text-decoration:none;font-weight:600;font-size:14px;">Otwórz próbkę</a>
      </div>`
    : "";

  const html = wrap(
    "Witamy w Templify",
    `
      <h1 style="margin:0 0 12px;font-size:26px;letter-spacing:-0.3px;">Cześć i dzięki, że jesteś.</h1>
      <p style="margin:0 0 12px;font-size:15px;">
        Templify to praktyczne ebooki i planery dla codziennego życia: finanse, zdrowie, macierzyństwo, produktywność, kariera. Nic tylko czyste, polskie tematy bez ściemy.
      </p>
      <p style="margin:0 0 8px;font-size:15px;">Co znajdziesz w newsletterze:</p>
      <ul style="margin:0 0 16px;padding-left:18px;color:${MUTED};font-size:14px;">
        <li>1 króciutki insight tygodniowo (na 90 sek.)</li>
        <li>Wczesny dostęp do nowych ebooków + zniżka -15% na start</li>
        <li>Zero spamu — tylko realne, użyteczne treści</li>
      </ul>
      ${sampleBlock}
      <p style="margin:24px 0 0;font-size:13px;color:${MUTED};">Jeśli kiedyś chcesz przestać dostawać te wiadomości, po prostu odpowiedz „WYPISZ" — to wystarczy.</p>
    `,
  );

  const text = `Cześć i dzięki, że jesteś z nami!

Templify to praktyczne ebooki i planery: finanse, zdrowie, macierzyństwo, produktywność.

Co znajdziesz w newsletterze:
- 1 króciutki insight tygodniowo
- Wczesny dostęp do nowych ebooków + -15% na start
- Zero spamu

${input.sampleUrl ? `Bezpłatna próbka: ${input.sampleUrl}\n\n` : ""}Templify
kontakt@templify.store
`;

  return {
    subject: "Witamy w Templify — co teraz?",
    html,
    text,
  };
}

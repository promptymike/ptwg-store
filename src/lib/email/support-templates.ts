// Helpdesk (kontakt) email templates: the internal notification that lands in
// the support inbox and the auto-acknowledgement sent back to the customer.
// Visual language mirrors templates.ts (order emails).

const ACCENT = "#b9763a";
const BG = "#faf6f0";
const PANEL = "#ffffff";
const TEXT = "#1a1612";
const MUTED = "#6b6256";
const BORDER = "#e9e1d4";

export const SUPPORT_TOPICS = [
  { value: "pytanie", label: "Pytanie o produkt" },
  { value: "zamowienie", label: "Problem z zamówieniem lub płatnością" },
  { value: "dostep", label: "Problem z dostępem / biblioteką" },
  { value: "zwrot", label: "Zwrot lub reklamacja" },
  { value: "inne", label: "Inny temat" },
] as const;

export type SupportTopic = (typeof SUPPORT_TOPICS)[number]["value"];

export function supportTopicLabel(topic: string) {
  return (
    SUPPORT_TOPICS.find((entry) => entry.value === topic)?.label ?? "Inny temat"
  );
}

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
              <td style="padding:28px 32px 24px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;">
                Templify — interaktywne planery i ebooki dla codziennego życia.<br/>
                Kontakt: <a href="mailto:ptwgadmin@gmail.com" style="color:${ACCENT};text-decoration:none;">ptwgadmin@gmail.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

type SupportRequestInput = {
  name: string;
  email: string;
  topic: string;
  orderRef?: string | null;
  message: string;
};

/** Internal notification delivered to the support inbox. */
export function renderSupportNotificationEmail(input: SupportRequestInput) {
  const topic = supportTopicLabel(input.topic);
  const subject = `[Helpdesk] ${topic} — ${input.name || input.email}`;

  const html = wrap(
    subject,
    `<h1 style="margin:0 0 12px;font-size:20px;">Nowe zgłoszenie z formularza kontaktowego</h1>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;font-size:14px;">
       <tr><td style="padding:6px 0;color:${MUTED};width:120px;">Od</td><td style="padding:6px 0;">${escape(input.name)} &lt;${escape(input.email)}&gt;</td></tr>
       <tr><td style="padding:6px 0;color:${MUTED};">Temat</td><td style="padding:6px 0;">${escape(topic)}</td></tr>
       ${input.orderRef ? `<tr><td style="padding:6px 0;color:${MUTED};">Zamówienie</td><td style="padding:6px 0;">${escape(input.orderRef)}</td></tr>` : ""}
     </table>
     <div style="border:1px solid ${BORDER};border-radius:12px;background:${BG};padding:16px;font-size:14px;white-space:pre-wrap;">${escape(input.message)}</div>
     <p style="margin:16px 0 0;font-size:13px;color:${MUTED};">Odpowiedz bezpośrednio na tego maila — trafi do klienta (reply-to).</p>`,
  );

  const text = `Nowe zgłoszenie z formularza kontaktowego

Od: ${input.name} <${input.email}>
Temat: ${topic}
${input.orderRef ? `Zamówienie: ${input.orderRef}\n` : ""}
${input.message}`;

  return { subject, html, text };
}

/** Auto-acknowledgement sent back to the customer. */
export function renderSupportAckEmail(input: SupportRequestInput) {
  const subject = "Otrzymaliśmy Twoją wiadomość — Templify";

  const html = wrap(
    subject,
    `<h1 style="margin:0 0 12px;font-size:20px;">Dzięki za wiadomość${input.name ? `, ${escape(input.name)}` : ""}!</h1>
     <p style="margin:0 0 12px;font-size:14px;">Twoje zgłoszenie dotarło do nas i ma temat: <strong>${escape(supportTopicLabel(input.topic))}</strong>. Odpowiadamy zwykle w ciągu jednego dnia roboczego.</p>
     <div style="border:1px solid ${BORDER};border-radius:12px;background:${BG};padding:16px;font-size:13px;color:${MUTED};white-space:pre-wrap;">${escape(input.message)}</div>
     <p style="margin:16px 0 0;font-size:14px;">Jeśli chcesz coś dodać, po prostu odpowiedz na tego maila.</p>`,
  );

  const text = `Dzięki za wiadomość${input.name ? `, ${input.name}` : ""}!

Twoje zgłoszenie (${supportTopicLabel(input.topic)}) dotarło do nas. Odpowiadamy zwykle w ciągu jednego dnia roboczego.

Twoja wiadomość:
${input.message}

Zespół Templify
ptwgadmin@gmail.com`;

  return { subject, html, text };
}

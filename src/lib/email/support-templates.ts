// Helpdesk (kontakt/pomoc) email templates: the internal notification that
// lands in the support inbox, the auto-acknowledgement sent back to the
// customer (with the ticket number) and the ticket-update email sent when an
// admin replies or changes the status. Visual language mirrors templates.ts
// (order emails).

const ACCENT = "#b9763a";
const BG = "#faf6f0";
const PANEL = "#ffffff";
const TEXT = "#1a1612";
const MUTED = "#6b6256";
const BORDER = "#e9e1d4";

// Topic list drives the public form select; reklamacja/odstąpienie/RODO/DSA
// are the formal channels required by the regulamin (§7, §7¹, §9, §10).
export const SUPPORT_TOPICS = [
  { value: "pytanie", label: "Pytanie o produkt" },
  { value: "zamowienie", label: "Problem z zamówieniem lub płatnością" },
  { value: "dostep", label: "Problem z dostępem / biblioteką" },
  { value: "reklamacja", label: "Reklamacja (niezgodność z umową)" },
  { value: "odstapienie", label: "Odstąpienie od umowy" },
  { value: "rodo", label: "Dane osobowe (RODO)" },
  { value: "dsa", label: "Zgłoszenie nielegalnych treści (DSA)" },
  { value: "inne", label: "Inny temat" },
] as const;

export type SupportTopic = (typeof SUPPORT_TOPICS)[number]["value"];

// Historical rows created before the topic list was extended.
const LEGACY_TOPIC_LABELS: Record<string, string> = {
  zwrot: "Zwrot lub reklamacja",
};

export function supportTopicLabel(topic: string) {
  return (
    SUPPORT_TOPICS.find((entry) => entry.value === topic)?.label ??
    LEGACY_TOPIC_LABELS[topic] ??
    "Inny temat"
  );
}

export const SUPPORT_STATUSES = [
  {
    value: "new",
    label: "Nowe",
    customerDescription: "Zgłoszenie czeka na pierwszą reakcję zespołu.",
  },
  {
    value: "in_progress",
    label: "W trakcie",
    customerDescription: "Pracujemy nad Twoim zgłoszeniem.",
  },
  {
    value: "waiting_customer",
    label: "Czekamy na odpowiedź",
    customerDescription: "Potrzebujemy od Ciebie dodatkowych informacji — odpisz na e-mail.",
  },
  {
    value: "resolved",
    label: "Rozwiązane",
    customerDescription: "Zgłoszenie zostało rozpatrzone.",
  },
  {
    value: "closed",
    label: "Zamknięte",
    customerDescription: "Zgłoszenie zostało zamknięte.",
  },
] as const;

export type SupportStatus = (typeof SUPPORT_STATUSES)[number]["value"];

export function supportStatusLabel(status: string) {
  return SUPPORT_STATUSES.find((entry) => entry.value === status)?.label ?? status;
}

export function supportStatusDescription(status: string) {
  return (
    SUPPORT_STATUSES.find((entry) => entry.value === status)?.customerDescription ?? ""
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
                Obsługa klienta i reklamacje: <a href="mailto:ptwgadmin@gmail.com" style="color:${ACCENT};text-decoration:none;">ptwgadmin@gmail.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function ticketBadge(ticketNumber: string) {
  return `<span style="display:inline-block;border:1px solid ${BORDER};background:${BG};border-radius:999px;padding:4px 12px;font-size:13px;font-weight:700;letter-spacing:0.4px;">${escape(ticketNumber)}</span>`;
}

type SupportRequestInput = {
  name: string;
  email: string;
  topic: string;
  orderRef?: string | null;
  message: string;
  ticketNumber: string;
  trackingUrl: string;
};

/** Internal notification delivered to the support inbox. */
export function renderSupportNotificationEmail(input: SupportRequestInput) {
  const topic = supportTopicLabel(input.topic);
  const subject = `[${input.ticketNumber}] ${topic} — ${input.name || input.email}`;

  const html = wrap(
    subject,
    `<h1 style="margin:0 0 12px;font-size:20px;">Nowe zgłoszenie ${ticketBadge(input.ticketNumber)}</h1>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0;font-size:14px;">
       <tr><td style="padding:6px 0;color:${MUTED};width:120px;">Od</td><td style="padding:6px 0;">${escape(input.name)} &lt;${escape(input.email)}&gt;</td></tr>
       <tr><td style="padding:6px 0;color:${MUTED};">Temat</td><td style="padding:6px 0;">${escape(topic)}</td></tr>
       ${input.orderRef ? `<tr><td style="padding:6px 0;color:${MUTED};">Zamówienie</td><td style="padding:6px 0;">${escape(input.orderRef)}</td></tr>` : ""}
     </table>
     <div style="border:1px solid ${BORDER};border-radius:12px;background:${BG};padding:16px;font-size:14px;white-space:pre-wrap;">${escape(input.message)}</div>
     <p style="margin:16px 0 0;font-size:13px;color:${MUTED};">Odpowiedz przez panel admina (Zgłoszenia) — klient dostanie maila i zobaczy odpowiedź na stronie statusu. Odpowiedź wprost na tego maila też trafi do klienta (reply-to), ale nie zapisze się w historii zgłoszenia.</p>`,
  );

  const text = `Nowe zgłoszenie ${input.ticketNumber}

Od: ${input.name} <${input.email}>
Temat: ${topic}
${input.orderRef ? `Zamówienie: ${input.orderRef}\n` : ""}
${input.message}`;

  return { subject, html, text };
}

/** Auto-acknowledgement sent back to the customer. */
export function renderSupportAckEmail(input: SupportRequestInput) {
  const isComplaint = input.topic === "reklamacja";
  const subject = `Przyjęliśmy Twoje zgłoszenie ${input.ticketNumber} — Templify`;

  const slaLine = isComplaint
    ? `Reklamację rozpatrzymy najpóźniej w ciągu <strong>14 dni</strong> od jej otrzymania — o wyniku poinformujemy Cię e-mailem (zgodnie z §7 Regulaminu).`
    : `Odpowiadamy zwykle w ciągu jednego dnia roboczego.`;

  const html = wrap(
    subject,
    `<h1 style="margin:0 0 12px;font-size:20px;">Dzięki za wiadomość${input.name ? `, ${escape(input.name)}` : ""}!</h1>
     <p style="margin:0 0 12px;font-size:14px;">Twoje zgłoszenie ma numer ${ticketBadge(input.ticketNumber)}<br/>Temat: <strong>${escape(supportTopicLabel(input.topic))}</strong>. ${slaLine}</p>
     <p style="margin:0 0 16px;font-size:14px;">Status zgłoszenia możesz śledzić w każdej chwili:</p>
     <p style="margin:0 0 16px;">
       <a href="${escape(input.trackingUrl)}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;border-radius:999px;padding:10px 22px;font-size:14px;font-weight:600;">Sprawdź status zgłoszenia</a>
     </p>
     <div style="border:1px solid ${BORDER};border-radius:12px;background:${BG};padding:16px;font-size:13px;color:${MUTED};white-space:pre-wrap;">${escape(input.message)}</div>
     <p style="margin:16px 0 0;font-size:14px;">Jeśli chcesz coś dodać, po prostu odpowiedz na tego maila i podaj numer zgłoszenia.</p>`,
  );

  const text = `Dzięki za wiadomość${input.name ? `, ${input.name}` : ""}!

Twoje zgłoszenie ma numer ${input.ticketNumber} (${supportTopicLabel(input.topic)}).
${isComplaint ? "Reklamację rozpatrzymy najpóźniej w ciągu 14 dni od jej otrzymania (zgodnie z §7 Regulaminu)." : "Odpowiadamy zwykle w ciągu jednego dnia roboczego."}

Status zgłoszenia sprawdzisz tutaj: ${input.trackingUrl}

Twoja wiadomość:
${input.message}

Zespół Templify
ptwgadmin@gmail.com`;

  return { subject, html, text };
}

type SupportUpdateInput = {
  name: string;
  ticketNumber: string;
  trackingUrl: string;
  newStatus?: string;
  reply?: string;
};

/** Sent to the customer when an admin replies and/or changes the status. */
export function renderSupportUpdateEmail(input: SupportUpdateInput) {
  const statusLabel = input.newStatus ? supportStatusLabel(input.newStatus) : null;
  const subject = input.reply
    ? `Odpowiedź w sprawie zgłoszenia ${input.ticketNumber} — Templify`
    : `Zmiana statusu zgłoszenia ${input.ticketNumber}: ${statusLabel} — Templify`;

  const statusBlock = statusLabel
    ? `<p style="margin:0 0 12px;font-size:14px;">Status zgłoszenia: <strong>${escape(statusLabel)}</strong>${
        input.newStatus ? ` — ${escape(supportStatusDescription(input.newStatus))}` : ""
      }</p>`
    : "";

  const replyBlock = input.reply
    ? `<div style="border:1px solid ${BORDER};border-radius:12px;background:${BG};padding:16px;font-size:14px;white-space:pre-wrap;">${escape(input.reply)}</div>`
    : "";

  const html = wrap(
    subject,
    `<h1 style="margin:0 0 12px;font-size:20px;">Aktualizacja zgłoszenia ${ticketBadge(input.ticketNumber)}</h1>
     <p style="margin:0 0 12px;font-size:14px;">Cześć${input.name ? ` ${escape(input.name)}` : ""}, mamy nowe informacje w Twojej sprawie.</p>
     ${statusBlock}
     ${replyBlock}
     <p style="margin:16px 0 0;">
       <a href="${escape(input.trackingUrl)}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;border-radius:999px;padding:10px 22px;font-size:14px;font-weight:600;">Zobacz pełną historię zgłoszenia</a>
     </p>
     <p style="margin:16px 0 0;font-size:13px;color:${MUTED};">Chcesz odpowiedzieć? Po prostu odpisz na tego maila, podając numer zgłoszenia.</p>`,
  );

  const text = `Aktualizacja zgłoszenia ${input.ticketNumber}

${statusLabel ? `Status: ${statusLabel}${input.newStatus ? ` — ${supportStatusDescription(input.newStatus)}` : ""}\n` : ""}${
    input.reply ? `\nOdpowiedź zespołu:\n${input.reply}\n` : ""
  }
Pełna historia zgłoszenia: ${input.trackingUrl}

Zespół Templify
ptwgadmin@gmail.com`;

  return { subject, html, text };
}

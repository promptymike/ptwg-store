import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, FileWarning, Mail, ScrollText, Shield, Ticket } from "lucide-react";

import { SupportForm } from "@/components/shared/support-form";
import { TicketLookupForm } from "@/components/support/ticket-lookup-form";
import { SUPPORT_TOPICS } from "@/lib/email/support-templates";
import { buildCanonicalMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import { getSiteSettingsSnapshot } from "@/lib/supabase/store";

export function generateMetadata(): Metadata {
  return buildCanonicalMetadata({
    title: "Pomoc, obsługa klienta i reklamacje",
    description:
      "Centrum pomocy Templify — obsługa klienta, formularz reklamacyjny, odstąpienie od umowy, zgłoszenia DSA i RODO. Sprawdź status swojego zgłoszenia po numerze.",
    path: "/pomoc",
  });
}

type PomocPageProps = {
  searchParams: Promise<{ temat?: string }>;
};

// Customer-service hub required by the regulamin (§7 formularz reklamacyjny w
// sekcji „Pomoc”) and by the payment-operator review: a clearly stated
// complaints channel with deadlines, plus ticket tracking.
export default async function PomocPage({ searchParams }: PomocPageProps) {
  const [settings, user, { temat }] = await Promise.all([
    getSiteSettingsSnapshot(),
    getCurrentUser(),
    searchParams,
  ]);

  const defaultTopic = SUPPORT_TOPICS.some((topic) => topic.value === temat)
    ? temat
    : undefined;

  return (
    <div className="shell section-space">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="max-w-2xl">
          <span className="eyebrow">Obsługa klienta</span>
          <h1 className="mt-4 text-4xl text-foreground sm:text-5xl">
            Pomoc i reklamacje
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Tu załatwisz każdą sprawę: pytania o produkty i zamówienia,{" "}
            <strong className="text-foreground">reklamacje</strong>, odstąpienie
            od umowy, sprawy danych osobowych (RODO) i zgłoszenia nielegalnych
            treści (DSA). Każde zgłoszenie dostaje numer, a jego status możesz
            śledzić na tej stronie.
          </p>
        </div>

        {/* Contact channels — the payment operator checks that the complaints
            e-mail is stated clearly and unambiguously. */}
        <section
          aria-label="Kanały kontaktu"
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="surface-panel p-6">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  E-mail obsługi klienta i reklamacji
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Wszystkie zgłoszenia — w tym reklamacje, odstąpienia od umowy
                  i sprawy RODO — obsługujemy pod adresem:
                </p>
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="mt-2 inline-block text-base font-semibold text-primary hover:text-primary/80"
                >
                  {settings.supportEmail}
                </a>
              </div>
            </div>
          </div>

          <div className="surface-panel p-6">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Terminy odpowiedzi
                </h2>
                <ul className="mt-1 space-y-1 text-sm leading-6 text-muted-foreground">
                  <li>
                    Zwykłe pytania — odpowiadamy najpóźniej{" "}
                    <strong className="text-foreground">
                      następnego dnia roboczego
                    </strong>
                    .
                  </li>
                  <li>
                    Reklamacje — rozpatrujemy w terminie{" "}
                    <strong className="text-foreground">14 dni</strong> od
                    otrzymania (§7 Regulaminu).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Ticket status checker */}
        <section
          id="status"
          aria-label="Sprawdź status zgłoszenia"
          className="surface-panel scroll-mt-24 p-6 sm:p-8"
        >
          <div className="flex items-start gap-3">
            <Ticket className="mt-1 size-5 shrink-0 text-primary" />
            <div className="w-full">
              <h2 className="text-xl font-semibold text-foreground">
                Sprawdź status zgłoszenia
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Podaj numer zgłoszenia (np. TPL-00123) i e-mail, którego użyłaś/eś
                w formularzu.
                {user ? (
                  <>
                    {" "}
                    Możesz też zajrzeć do{" "}
                    <Link
                      href="/konto/zgloszenia"
                      className="font-medium text-primary underline underline-offset-2"
                    >
                      historii zgłoszeń w swoim koncie
                    </Link>
                    .
                  </>
                ) : null}
              </p>
              <div className="mt-4">
                <TicketLookupForm />
              </div>
            </div>
          </div>
        </section>

        {/* Complaint form */}
        <div
          id="formularz"
          className="grid scroll-mt-24 gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-start"
        >
          <section
            className="surface-panel p-6 sm:p-8"
            aria-label="Formularz zgłoszenia i reklamacji"
          >
            <h2 className="text-xl font-semibold text-foreground">
              Formularz zgłoszenia
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Ten formularz służy też jako{" "}
              <strong className="text-foreground">formularz reklamacyjny</strong>{" "}
              (temat: „Reklamacja”) — zgodnie z §7 Regulaminu.
            </p>
            <div className="mt-5">
              <SupportForm
                defaultEmail={user?.email ?? undefined}
                defaultTopic={defaultTopic}
              />
            </div>
          </section>

          <aside className="space-y-4">
            <div className="surface-panel p-6">
              <div className="flex items-start gap-3">
                <FileWarning className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Jak złożyć skuteczną reklamację?
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    W zgłoszeniu podaj: imię i nazwisko, e-mail przypisany do
                    konta, numer zamówienia, opis problemu i — jeśli możesz —
                    zrzuty ekranu. Rozpatrzymy ją w ciągu{" "}
                    <strong className="text-foreground">14 dni</strong>; brak
                    odpowiedzi w tym terminie oznacza uznanie reklamacji.
                  </p>
                  <Link
                    href="/regulamin#s7"
                    className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-2"
                  >
                    Reklamacje w Regulaminie (§7) →
                  </Link>
                </div>
              </div>
            </div>

            <div className="surface-panel p-6">
              <div className="flex items-start gap-3">
                <ScrollText className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Odstąpienie od umowy
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Kupując treść cyfrową z natychmiastową dostawą wyrażasz
                    zgodę na jej dostarczenie przed upływem 14 dni i tracisz
                    ustawowe prawo odstąpienia (art. 38 ust. 1 pkt 13 UPK).
                    Jeśli w Twoim przypadku prawo odstąpienia przysługuje,
                    skorzystaj ze wzoru w Załączniku nr 1 do Regulaminu.
                  </p>
                  <Link
                    href="/regulamin#s9"
                    className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-2"
                  >
                    Odstąpienie w Regulaminie (§9) →
                  </Link>
                </div>
              </div>
            </div>

            <div className="surface-panel p-6">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    RODO i zgłoszenia DSA
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Sprawy danych osobowych (dostęp, sprostowanie, usunięcie)
                    oraz zgłoszenia nielegalnych treści obsługujemy tym samym
                    formularzem — wybierz odpowiedni temat. Szczegóły w{" "}
                    <Link
                      href="/polityka-prywatnosci"
                      className="font-medium text-primary underline underline-offset-2"
                    >
                      Polityce Prywatności
                    </Link>{" "}
                    i{" "}
                    <Link
                      href="/regulamin#s71"
                      className="font-medium text-primary underline underline-offset-2"
                    >
                      §7¹ Regulaminu
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

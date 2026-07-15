import type { Metadata } from "next";
import { Clock3, Mail, MessageCircleQuestion, ShieldCheck } from "lucide-react";

import { SupportForm } from "@/components/shared/support-form";
import { buildCanonicalMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import {
  getContentPageBySlug,
  getSiteSettingsSnapshot,
} from "@/lib/supabase/store";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPageBySlug("kontakt");

  return buildCanonicalMetadata({
    title: page?.title ?? "Kontakt i pomoc",
    description:
      page?.description ??
      "Helpdesk Templify — pytania o produkty, zamówienia, zwroty i reklamacje. Odpowiadamy w ciągu jednego dnia roboczego.",
    path: "/kontakt",
  });
}

export default async function ContactPage() {
  const [settings, user] = await Promise.all([
    getSiteSettingsSnapshot(),
    getCurrentUser(),
  ]);

  return (
    <div className="shell section-space">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <span className="eyebrow">Helpdesk</span>
          <h1 className="mt-4 text-4xl text-foreground sm:text-5xl">
            Napisz do nas — pomożemy
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Pytania o produkty, problemy z zamówieniem, zwroty i reklamacje.
            Wypełnij formularz, a zgłoszenie trafi prosto do naszej skrzynki
            pomocy. Odpowiadamy najpóźniej następnego dnia roboczego.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <section className="surface-panel p-6 sm:p-8" aria-label="Formularz kontaktowy">
            <SupportForm defaultEmail={user?.email ?? undefined} />
          </section>

          <aside className="space-y-4">
            <div className="surface-panel p-6">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">E-mail</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Wolisz napisać bezpośrednio? Wszystkie zgłoszenia, uwagi i
                    reklamacje obsługujemy pod adresem:
                  </p>
                  <a
                    href={`mailto:${settings.supportEmail}`}
                    className="mt-2 inline-block font-semibold text-primary hover:text-primary/80"
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
                  <h2 className="text-lg font-semibold text-foreground">Czas odpowiedzi</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Zwykle odpisujemy tego samego dnia, maksymalnie w ciągu
                    jednego dnia roboczego.
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-panel p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Reklamacje</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Reklamacje rozpatrujemy w ciągu 14 dni (§7 Regulaminu).
                    Wybierz temat „Reklamacja”, podaj numer zamówienia — a
                    status zgłoszenia śledzisz na stronie{" "}
                    <a
                      href="/pomoc"
                      className="font-medium text-primary underline underline-offset-2"
                    >
                      Pomoc
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-panel p-6">
              <div className="flex items-start gap-3">
                <MessageCircleQuestion className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Szybkie odpowiedzi</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Zanim napiszesz, zajrzyj do sekcji FAQ na stronie głównej —
                    kwestie dostępu, płatności i faktur są tam opisane.
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

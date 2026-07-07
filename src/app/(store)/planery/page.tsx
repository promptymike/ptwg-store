import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Cloud, Layers3, ShieldCheck, Smartphone } from "lucide-react";

import { PlannerCard, PlannerVisual } from "@/components/planners/planner-card";
import { Button } from "@/components/ui/button";
import { interactivePlanners } from "@/data/interactive-planners";
import { buildCanonicalMetadata } from "@/lib/seo";
import { getCurrentUser } from "@/lib/session";
import { getOwnedProductIds } from "@/lib/supabase/store";

export const metadata: Metadata = buildCanonicalMetadata({
  title: "Interaktywne planery online — skończ z Excelem",
  description: "Porównaj planery online Templify do budżetu, rodziny, podróży, posiłków i firmy. Zobacz działające demo i wybierz system dla siebie.",
  path: "/planery",
});

export default async function PlannersPage() {
  const user = await getCurrentUser();
  const ownedProductIds = await getOwnedProductIds(user?.id ?? null);
  const home = interactivePlanners.filter((planner) => planner.audience === "Życie i dom");
  const business = interactivePlanners.filter((planner) => planner.audience === "Firma i zespół");
  const lead = interactivePlanners[0];

  return (
    <main>
      <section className="shell py-10 sm:py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_.98fr] lg:items-center">
          <div>
            <span className="eyebrow">Interaktywne planery Templify</span>
            <h1 className="mt-6 max-w-5xl font-heading text-[clamp(3rem,7.5vw,6.6rem)] font-bold leading-[.9] tracking-[-.055em] text-foreground">
              Skończ z Excelem. Kontroluj swoje życie <span className="text-primary">z telefonu.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Gotowe systemy, które naprawdę pracują. Wpisujesz dane, planer zapisuje je automatycznie, a Ty wracasz dokładnie tam, gdzie skończyłeś — na każdym urządzeniu.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" render={<Link href="#dla-ciebie" />}>Wybierz swój planer<ArrowRight className="size-4" /></Button>
              <Button size="lg" variant="outline" render={<Link href={`/planery/${lead.slug}/demo`} />}>Wypróbuj bezpłatne demo</Button>
            </div>
            <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                [Cloud, "Automatyczny zapis"],
                [Smartphone, "Telefon i komputer"],
                [ShieldCheck, "Prywatne dane"],
              ].map(([Icon, label]) => (
                <div key={label as string} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/55 px-4 py-3 text-sm text-foreground">
                  <Icon className="size-4 text-primary" />{label as string}
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-border/60 shadow-[0_35px_100px_-45px_rgba(0,0,0,.55)]">
            <PlannerVisual planner={lead} />
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-card/35 py-8">
        <div className="shell grid gap-5 md:grid-cols-3">
          {[
            [Layers3, "Nie kolejny plik", "Dostajesz działające narzędzie, nie pusty arkusz do skonfigurowania."],
            [CheckCircle2, "Gotowy od pierwszego kliknięcia", "Kategorie, widoki i procesy są już zaprojektowane."],
            [Cloud, "Zawsze aktualny", "Twoje zmiany zapisują się automatycznie na koncie Templify."],
          ].map(([Icon, title, copy]) => (
            <div key={title as string} className="flex gap-4 p-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background"><Icon className="size-5" /></span>
              <div><h2 className="font-semibold text-foreground">{title as string}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{copy as string}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section id="dla-ciebie" className="shell section-space">
        <div className="max-w-3xl"><span className="eyebrow">Dla Ciebie i domu</span><h2 className="mt-5 text-4xl text-foreground sm:text-6xl">Codzienność pod kontrolą, bez życia w tabelkach.</h2><p className="mt-4 text-muted-foreground">Finanse, rodzina, posiłki, podróże i większe wydarzenia — każde w osobnym, dopracowanym systemie.</p></div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">{home.map((planner) => <PlannerCard key={planner.slug} planner={planner} isOwned={ownedProductIds.has(planner.id)} />)}</div>
      </section>

      {/* Fixed dark plate (not bg-foreground): the token would flip light in
          dark mode and drown the amber eyebrow + planner cards. */}
      <section className="border-y border-border/60 bg-[#14110c] py-16 text-stone-50 sm:py-20">
        <div className="shell"><div className="max-w-3xl"><span className="text-xs font-bold uppercase tracking-[.22em] text-amber-300">Dla firmy i zespołu</span><h2 className="mt-5 text-4xl sm:text-6xl">Mniej administracji. Więcej prowadzenia biznesu.</h2><p className="mt-5 text-white/65">Specjalistyczne systemy dla zespołów, salonów beauty oraz budowy i remontu.</p></div><div className="mt-10 grid gap-6 lg:grid-cols-3">{business.map((planner) => <PlannerCard key={planner.slug} planner={planner} isOwned={ownedProductIds.has(planner.id)} />)}</div></div>
      </section>
    </main>
  );
}

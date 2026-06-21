import Link from "next/link";
import { ArrowRight, Cloud, LockKeyhole, Smartphone, Sparkles } from "lucide-react";

import { PlannerVisual } from "@/components/planners/planner-card";
import { Button } from "@/components/ui/button";
import { interactivePlanners } from "@/data/interactive-planners";

export function InteractivePlannerHero() {
  const featured = interactivePlanners.slice(0, 3);

  return (
    <section className="shell pt-6 sm:pt-10 lg:pt-14">
      <div className="relative isolate overflow-hidden rounded-[2rem] border border-stone-950/10 bg-[#11100d] px-6 py-10 text-stone-50 shadow-[0_40px_120px_-55px_rgba(0,0,0,.75)] sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div className="absolute -left-32 top-12 size-80 rounded-full bg-orange-400/15 blur-[90px]" />
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-emerald-400/15 blur-[110px]" />
        <div className="relative grid gap-12 lg:grid-cols-[1.03fr_.97fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.19em] text-white/75">
              <Sparkles className="size-3.5 text-amber-300" /> Planery nowej generacji
            </div>
            <h1 className="mt-6 max-w-4xl font-heading text-[clamp(3rem,7vw,6.8rem)] font-bold leading-[.88] tracking-[-.055em]">
              Interaktywne planery online. <span className="text-amber-300">Ogarnij życie</span> z telefonu.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              Najlepsze interaktywne planery do finansów, rodziny, posiłków i pracy. Wpisujesz raz, dane zapisują się automatycznie, a Ty masz wszystko zawsze pod ręką.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="bg-amber-300 text-stone-950 hover:bg-amber-200" render={<Link href="/planery" />}>Zobacz interaktywne planery<ArrowRight className="size-4" /></Button>
              <Button size="lg" variant="outline" className="!border-white/25 !bg-white/10 !text-white hover:!bg-white/15" render={<Link href="/planery/planer-finansow/demo" />}>Uruchom demo</Button>
            </div>
            <div className="mt-9 grid gap-3 text-xs text-white/60 sm:grid-cols-3">
              <span className="flex items-center gap-2"><Cloud className="size-4 text-emerald-300" />Automatyczny zapis</span>
              <span className="flex items-center gap-2"><Smartphone className="size-4 text-sky-300" />Telefon i komputer</span>
              <span className="flex items-center gap-2"><LockKeyhole className="size-4 text-violet-300" />Prywatne dane</span>
            </div>
          </div>

          <div className="relative min-h-[390px] sm:min-h-[500px]">
            {featured.map((planner, index) => (
              <Link
                key={planner.slug}
                href={`/planery/${planner.slug}`}
                className="absolute block w-[78%] overflow-hidden rounded-[1.4rem] border border-white/20 bg-white shadow-2xl transition duration-500 hover:z-30 hover:-translate-y-3"
                style={{ left: `${index * 10}%`, top: `${index * 15}%`, transform: `rotate(${(index - 1) * 4}deg)`, zIndex: 10 + index }}
              >
                <PlannerVisual planner={planner} compact />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

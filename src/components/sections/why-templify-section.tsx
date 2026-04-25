import { SectionHeading } from "@/components/shared/section-heading";
import type { SiteSectionContent } from "@/types/store";

const reasons = [
  {
    title: "Konkret, nie ściema",
    description:
      "Każdy ebook jest napisany przez praktyków, dla zwykłych ludzi. Bez wodolejstwa, bez teorii.",
  },
  {
    title: "Działa na każdym urządzeniu",
    description:
      "Pliki HTML otwierasz w przeglądarce — na telefonie, tablecie i komputerze. Bez instalacji aplikacji.",
  },
  {
    title: "Pobierasz natychmiast",
    description:
      "Po opłaceniu masz pliki w bibliotece od razu. Możesz zacząć czytać tego samego wieczoru.",
  },
];

type WhyTemplifySectionProps = {
  content: SiteSectionContent;
};

export function WhyTemplifySection({
  content,
}: WhyTemplifySectionProps) {
  return (
    <section className="shell section-space">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <SectionHeading
          badge={content.eyebrow}
          title={content.title}
          description={content.description}
        />

        <div className="grid gap-4 md:grid-cols-3">
          {reasons.map((reason) => (
            <article key={reason.title} className="surface-panel p-5">
              <p className="text-lg text-foreground">{reason.title}</p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {reason.description}
              </p>
            </article>
          ))}

          <article className="rounded-[1.8rem] border border-border/70 bg-foreground p-6 text-background md:col-span-3">
            <p className="text-sm leading-7 text-background/80">{content.body}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

import { SectionHeading } from "@/components/shared/section-heading";
import type { SiteSectionContent } from "@/types/store";

const reasons = [
  {
    title: "Sell the result",
    description:
      "Copy, hierarchy and cards are framed around transformation instead of file format.",
  },
  {
    title: "Keep the premium feel readable",
    description:
      "Editorial spacing, calm color balance and clear conversion paths keep the experience expensive-looking without getting busy.",
  },
  {
    title: "Ready for real operations",
    description:
      "Supabase, Stripe, legal pages and admin workflows are already part of the product layer.",
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
      <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
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

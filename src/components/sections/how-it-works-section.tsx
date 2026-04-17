import { SectionHeading } from "@/components/shared/section-heading";
import type { SiteSectionContent } from "@/types/store";

const steps = [
  {
    step: "01",
    title: "Choose the system",
    description:
      "Browse by category or outcome and pick the template that solves the next bottleneck.",
  },
  {
    step: "02",
    title: "Checkout once",
    description:
      "Secure Stripe checkout keeps the flow quick while the order is tied to a real account.",
  },
  {
    step: "03",
    title: "Access your library",
    description:
      "Products appear in the customer library automatically after successful payment.",
  },
  {
    step: "04",
    title: "Implement immediately",
    description:
      "Files, Notion systems and packs are structured to be useful on day one, not after a full setup project.",
  },
];

type HowItWorksSectionProps = {
  content: SiteSectionContent;
};

export function HowItWorksSection({
  content,
}: HowItWorksSectionProps) {
  return (
    <section className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge={content.eyebrow}
          title={content.title}
          description={content.description}
        />

        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.step} className="surface-panel p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
                {step.step}
              </p>
              <h3 className="mt-3 text-2xl text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{content.body}</p>
      </div>
    </section>
  );
}

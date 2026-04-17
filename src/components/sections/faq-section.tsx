import { SectionHeading } from "@/components/shared/section-heading";
import type { FaqItem, SiteSectionContent } from "@/types/store";

type FaqSectionProps = {
  content: SiteSectionContent;
  faqs: FaqItem[];
};

export function FaqSection({ content, faqs }: FaqSectionProps) {
  return (
    <section id="faq" className="shell section-space">
      <div className="space-y-8">
        <SectionHeading
          badge={content.eyebrow}
          title={content.title}
          description={content.description}
        />

        <div className="grid gap-4">
          {faqs.map((faq) => (
            <details
              key={faq.id}
              className="surface-panel group overflow-hidden p-5"
            >
              <summary className="cursor-pointer list-none text-lg text-foreground">
                {faq.question}
              </summary>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{content.body}</p>
      </div>
    </section>
  );
}

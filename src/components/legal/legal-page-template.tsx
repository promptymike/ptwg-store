import { notFound } from "next/navigation";

import { getContentPageBySlug } from "@/lib/supabase/store";

type LegalPageTemplateProps = {
  slug: string;
};

export async function LegalPageTemplate({
  slug,
}: LegalPageTemplateProps) {
  const page = await getContentPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const paragraphs = page.body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="shell section-space">
      <article className="surface-panel mx-auto max-w-4xl space-y-6 p-6 sm:p-8">
        <span className="eyebrow">Legal / content</span>
        <div className="space-y-3">
          <h1 className="text-4xl text-foreground sm:text-5xl">{page.title}</h1>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            {page.description}
          </p>
        </div>

        <div className="space-y-4 text-sm leading-8 text-muted-foreground sm:text-base">
          {paragraphs.length > 0
            ? paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            : <p>{page.body}</p>}
        </div>
      </article>
    </div>
  );
}

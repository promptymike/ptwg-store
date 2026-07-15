import { notFound } from "next/navigation";

import {
  getContentPageBySlug,
  getSiteSettingsSnapshot,
} from "@/lib/supabase/store";

type LegalPageTemplateProps = {
  slug: string;
};

export async function LegalPageTemplate({
  slug,
}: LegalPageTemplateProps) {
  const [page, settings] = await Promise.all([
    getContentPageBySlug(slug),
    getSiteSettingsSnapshot(),
  ]);

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

        {slug === "regulamin" ? (
          <section className="rounded-2xl border border-border/70 bg-secondary/35 p-5 text-sm leading-7 text-muted-foreground">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Operator sklepu</p>
            {settings.businessName ? <p className="mt-2 font-semibold text-foreground">{settings.businessName}</p> : null}
            {settings.businessAddress ? <p>{settings.businessAddress}</p> : null}
            <p>{settings.supportEmail}</p>
            {settings.businessPhone ? <p>{settings.businessPhone}</p> : null}
          </section>
        ) : null}

        <div className="space-y-4 text-sm leading-8 text-muted-foreground sm:text-base">
          {paragraphs.length > 0
            ? paragraphs.map((paragraph) => {
                const [firstLine, ...rest] = paragraph.split("\n");
                if (/^§\s*\d+\./.test(firstLine)) {
                  return (
                    <section key={paragraph} className="space-y-2 border-t border-border/50 pt-5 first:border-0 first:pt-0">
                      <h2 className="text-2xl text-foreground">{firstLine}</h2>
                      {rest.length > 0 ? <p>{rest.join("\n")}</p> : null}
                    </section>
                  );
                }
                return <p key={paragraph}>{paragraph}</p>;
              })
            : <p>{page.body}</p>}
        </div>
      </article>
    </div>
  );
}

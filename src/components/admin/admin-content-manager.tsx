import {
  createContentPageAction,
  createFaqAction,
  createTestimonialAction,
  deleteContentPageAction,
  deleteFaqAction,
  deleteTestimonialAction,
  updateContentPageAction,
  updateFaqAction,
  updateSiteSectionAction,
  updateTestimonialAction,
} from "@/app/admin/actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SectionRecord = {
  id?: string;
  key: string;
  eyebrow: string;
  title: string;
  description: string;
  body: string;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  isPublished?: boolean;
};

type FaqRecord = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
};

type TestimonialRecord = {
  id: string;
  author: string;
  role: string;
  quote: string;
  score: string;
  sortOrder: number;
  isPublished: boolean;
};

type ContentPageRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  isPublished: boolean;
};

type AdminContentManagerProps = {
  sections: SectionRecord[];
  faqs: FaqRecord[];
  testimonials: TestimonialRecord[];
  pages: ContentPageRecord[];
};

export function AdminContentManager({
  sections,
  faqs,
  testimonials,
  pages,
}: AdminContentManagerProps) {
  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Homepage content</h2>
          <p className="text-sm text-muted-foreground">
            Zarządzaj hero, featured, use cases, FAQ intro i innymi blokami bez dotykania kodu.
          </p>
        </div>

        <div className="grid gap-4">
          {sections.map((section) => (
            <article
              key={section.key}
              className="rounded-[1.4rem] border border-border/70 bg-background/60 p-4"
            >
              <form action={updateSiteSectionAction} className="grid gap-4 xl:grid-cols-2">
                <input type="hidden" name="sectionId" value={section.id} />
                <input type="hidden" name="sectionKey" value={section.key} />

                <label className="space-y-2">
                  <span className="text-sm text-foreground">Eyebrow</span>
                  <Input name="eyebrow" defaultValue={section.eyebrow} />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-foreground">Sekcja</span>
                  <Input value={section.key} readOnly />
                </label>

                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm text-foreground">Tytuł</span>
                  <Textarea name="title" defaultValue={section.title} className="min-h-20" />
                </label>

                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm text-foreground">Opis</span>
                  <Textarea
                    name="description"
                    defaultValue={section.description}
                    className="min-h-24"
                  />
                </label>

                <label className="space-y-2 xl:col-span-2">
                  <span className="text-sm text-foreground">Treść dodatkowa</span>
                  <Textarea name="body" defaultValue={section.body} className="min-h-24" />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-foreground">CTA label</span>
                  <Input name="ctaLabel" defaultValue={section.ctaLabel ?? ""} />
                </label>

                <label className="space-y-2">
                  <span className="text-sm text-foreground">CTA href</span>
                  <Input name="ctaHref" defaultValue={section.ctaHref ?? ""} />
                </label>

                <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground xl:col-span-2">
                  <input
                    name="isPublished"
                    type="checkbox"
                    defaultChecked={section.isPublished ?? true}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Sekcja opublikowana
                </label>

                <AdminSubmitButton
                  idleLabel="Zapisz sekcję"
                  pendingLabel="Zapisywanie..."
                  className="xl:col-span-2"
                />
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">FAQ</h2>
          <p className="text-sm text-muted-foreground">
            Krótkie odpowiedzi sprzedażowe i operacyjne dla storefrontu.
          </p>
        </div>

        <form action={createFaqAction} className="grid gap-4 rounded-[1.4rem] border border-border/70 bg-background/60 p-4">
          <Input name="question" placeholder="Jak szybko dostanę produkt?" />
          <Textarea name="answer" className="min-h-24" placeholder="Po potwierdzeniu płatności..." />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="sortOrder" type="number" defaultValue="0" />
            <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground">
              <input
                name="isPublished"
                type="checkbox"
                defaultChecked
                className="size-4 accent-[var(--color-primary)]"
              />
              Opublikowane
            </label>
          </div>
          <AdminSubmitButton idleLabel="Dodaj FAQ" pendingLabel="Dodawanie..." />
        </form>

        <div className="grid gap-4">
          {faqs.map((faq) => (
            <article key={faq.id} className="rounded-[1.4rem] border border-border/70 bg-background/60 p-4">
              <form action={updateFaqAction} className="grid gap-4">
                <input type="hidden" name="faqId" value={faq.id} />
                <Input name="question" defaultValue={faq.question} />
                <Textarea name="answer" defaultValue={faq.answer} className="min-h-24" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input name="sortOrder" type="number" defaultValue={faq.sortOrder} />
                  <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground">
                    <input
                      name="isPublished"
                      type="checkbox"
                      defaultChecked={faq.isPublished}
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    Opublikowane
                  </label>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <AdminSubmitButton idleLabel="Zapisz FAQ" pendingLabel="Zapisywanie..." />
                </div>
              </form>
              <form action={deleteFaqAction} className="mt-3">
                <input type="hidden" name="faqId" value={faq.id} />
                <AdminSubmitButton
                  idleLabel="Usuń FAQ"
                  pendingLabel="Usuwanie..."
                  variant="destructive"
                />
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Testimonials</h2>
          <p className="text-sm text-muted-foreground">
            Opinie i proof points dla sekcji społecznego dowodu.
          </p>
        </div>

        <form action={createTestimonialAction} className="grid gap-4 rounded-[1.4rem] border border-border/70 bg-background/60 p-4 xl:grid-cols-2">
          <Input name="author" placeholder="Marta" />
          <Input name="role" placeholder="studio brandingowe" />
          <Textarea name="quote" className="min-h-24 xl:col-span-2" placeholder="Ta templatyzacja..." />
          <Input name="score" type="number" step="0.1" min="0" max="5" defaultValue="5.0" />
          <Input name="sortOrder" type="number" defaultValue="0" />
          <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground xl:col-span-2">
            <input
              name="isPublished"
              type="checkbox"
              defaultChecked
              className="size-4 accent-[var(--color-primary)]"
            />
            Opublikowane
          </label>
          <AdminSubmitButton idleLabel="Dodaj opinię" pendingLabel="Dodawanie..." className="xl:col-span-2" />
        </form>

        <div className="grid gap-4">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="rounded-[1.4rem] border border-border/70 bg-background/60 p-4"
            >
              <form action={updateTestimonialAction} className="grid gap-4 xl:grid-cols-2">
                <input type="hidden" name="testimonialId" value={testimonial.id} />
                <Input name="author" defaultValue={testimonial.author} />
                <Input name="role" defaultValue={testimonial.role} />
                <Textarea
                  name="quote"
                  defaultValue={testimonial.quote}
                  className="min-h-24 xl:col-span-2"
                />
                <Input name="score" type="number" step="0.1" min="0" max="5" defaultValue={testimonial.score} />
                <Input name="sortOrder" type="number" defaultValue={testimonial.sortOrder} />
                <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground xl:col-span-2">
                  <input
                    name="isPublished"
                    type="checkbox"
                    defaultChecked={testimonial.isPublished}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Opublikowane
                </label>
                <AdminSubmitButton
                  idleLabel="Zapisz opinię"
                  pendingLabel="Zapisywanie..."
                  className="xl:col-span-2"
                />
              </form>
              <form action={deleteTestimonialAction} className="mt-3">
                <input type="hidden" name="testimonialId" value={testimonial.id} />
                <AdminSubmitButton
                  idleLabel="Usuń opinię"
                  pendingLabel="Usuwanie..."
                  variant="destructive"
                />
              </form>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Strony i legal</h2>
          <p className="text-sm text-muted-foreground">
            Regulamin, polityki, kontakt i dowolne dodatkowe strony redakcyjne.
          </p>
        </div>

        <form action={createContentPageAction} className="grid gap-4 rounded-[1.4rem] border border-border/70 bg-background/60 p-4 xl:grid-cols-2">
          <Input name="slug" placeholder="polityka-prywatnosci" />
          <Input name="title" placeholder="Polityka prywatności" />
          <Textarea name="description" className="min-h-20 xl:col-span-2" placeholder="Krótki opis strony..." />
          <Textarea name="body" className="min-h-32 xl:col-span-2" placeholder="Treść strony..." />
          <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground xl:col-span-2">
            <input
              name="isPublished"
              type="checkbox"
              defaultChecked
              className="size-4 accent-[var(--color-primary)]"
            />
            Opublikowana
          </label>
          <AdminSubmitButton idleLabel="Dodaj stronę" pendingLabel="Dodawanie..." className="xl:col-span-2" />
        </form>

        <div className="grid gap-4">
          {pages.map((page) => (
            <article key={page.id} className="rounded-[1.4rem] border border-border/70 bg-background/60 p-4">
              <form action={updateContentPageAction} className="grid gap-4">
                <input type="hidden" name="pageId" value={page.id} />
                <div className="grid gap-4 xl:grid-cols-2">
                  <Input name="slug" defaultValue={page.slug} />
                  <Input name="title" defaultValue={page.title} />
                </div>
                <Textarea name="description" defaultValue={page.description} className="min-h-20" />
                <Textarea name="body" defaultValue={page.body} className="min-h-32" />
                <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground">
                  <input
                    name="isPublished"
                    type="checkbox"
                    defaultChecked={page.isPublished}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Opublikowana
                </label>
                <AdminSubmitButton idleLabel="Zapisz stronę" pendingLabel="Zapisywanie..." />
              </form>
              <form action={deleteContentPageAction} className="mt-3">
                <input type="hidden" name="pageId" value={page.id} />
                <AdminSubmitButton
                  idleLabel="Usuń stronę"
                  pendingLabel="Usuwanie..."
                  variant="destructive"
                />
              </form>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

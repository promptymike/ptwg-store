export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <span className="eyebrow">Ustawienia</span>
          <h2 className="text-3xl text-foreground">Praktyczne checklisty dla zespołu</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Ta sekcja pełni rolę lekkiego centrum operacyjnego. Trzyma najważniejsze kroki,
            które zespół powinien znać przed dalszą rozbudową o marketing automation i Stripe metadata.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
            <p className="text-sm font-medium text-foreground">Storage</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Bucket `product-files` powinien zostać prywatny. `product-covers` może być prywatny
              lub kontrolowany przez signed URL, zależnie od polityki zespołu.
            </p>
          </article>

          <article className="rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
            <p className="text-sm font-medium text-foreground">Allowlista adminów</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Dodanie maila do allowlisty wystarcza. Po następnym logowaniu lub rejestracji rola
              profilu synchronizuje się automatycznie z bazą.
            </p>
          </article>

          <article className="rounded-[1.4rem] border border-border/70 bg-background/60 p-5">
            <p className="text-sm font-medium text-foreground">Content ops</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Homepage, FAQ, testimonials i legal pages możesz edytować z panelu `Content / Strony`
              bez ingerencji w komponenty storefrontu.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AdminCategoryManagerProps = {
  categories: Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
  }>;
};

export function AdminCategoryManager({
  categories,
}: AdminCategoryManagerProps) {
  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Nowa kategoria</h2>
          <p className="text-sm text-muted-foreground">
            Kategorie sterują filtrowaniem katalogu, use caseami i logiką przypisywania produktów.
          </p>
        </div>

        <form action={createCategoryAction} className="grid gap-4 xl:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-foreground">Nazwa</span>
            <Input name="name" placeholder="Planowanie i Notion" />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-foreground">Slug</span>
            <Input name="slug" placeholder="planowanie-i-notion" />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-foreground">Sortowanie</span>
            <Input name="sortOrder" defaultValue="0" type="number" />
          </label>

          <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-3 text-sm text-foreground">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked
              className="size-4 accent-[var(--color-primary)]"
            />
            Aktywna kategoria
          </label>

          <label className="space-y-2 xl:col-span-2">
            <span className="text-sm text-foreground">Opis</span>
            <Textarea
              name="description"
              placeholder="Opisz kategorię tak, jak ma być rozumiana przez klienta i zespół."
              className="min-h-28"
            />
          </label>

          <AdminSubmitButton
            idleLabel="Utwórz kategorię"
            pendingLabel="Tworzenie kategorii..."
            className="w-full xl:col-span-2"
          />
        </form>
      </section>

      <section className="surface-panel space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-foreground">Edycja kategorii</h2>
          <p className="text-sm text-muted-foreground">
            Każdą kategorię możesz zaktualizować lub wyłączyć bez zmiany istniejących routeów.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="rounded-[1.2rem] border border-border/70 bg-background/60 px-4 py-4 text-sm text-muted-foreground">
            Nie ma jeszcze żadnych kategorii do edycji.
          </p>
        ) : (
          <div className="grid gap-4">
            {categories.map((category) => (
              <article
                key={category.id}
                className="rounded-[1.4rem] border border-border/70 bg-background/60 p-4"
              >
                <form action={updateCategoryAction} className="grid gap-4 xl:grid-cols-2">
                  <input type="hidden" name="categoryId" value={category.id} />

                  <label className="space-y-2">
                    <span className="text-sm text-foreground">Nazwa</span>
                    <Input name="name" defaultValue={category.name} />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-foreground">Slug</span>
                    <Input name="slug" defaultValue={category.slug} />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-foreground">Sortowanie</span>
                    <Input
                      name="sortOrder"
                      defaultValue={String(category.sortOrder)}
                      type="number"
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={category.isActive}
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    Aktywna kategoria
                  </label>

                  <label className="space-y-2 xl:col-span-2">
                    <span className="text-sm text-foreground">Opis</span>
                    <Textarea
                      name="description"
                      defaultValue={category.description}
                      className="min-h-24"
                    />
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row xl:col-span-2">
                    <AdminSubmitButton
                      idleLabel="Zapisz zmiany"
                      pendingLabel="Zapisywanie..."
                    />
                  </div>
                </form>

                <form action={deleteCategoryAction} className="mt-3">
                  <input type="hidden" name="categoryId" value={category.id} />
                  <AdminSubmitButton
                    idleLabel="Usuń kategorię"
                    pendingLabel="Usuwanie..."
                    variant="destructive"
                  />
                </form>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

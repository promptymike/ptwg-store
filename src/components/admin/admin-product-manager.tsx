import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/admin/actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  categoryId: string;
  format: string;
  pages: number;
  tags: string[];
  rating: number;
  salesLabel: string;
  accent: string;
  coverGradient: string;
  includes: string[];
  heroNote: string;
  bestseller: boolean;
  featured: boolean;
  isActive: boolean;
  coverPath: string | null;
  filePath: string | null;
};

type AdminProductManagerProps = {
  categories: CategoryOption[];
  products: ProductRecord[];
};

function CategorySelect({
  categories,
  defaultValue,
}: {
  categories: CategoryOption[];
  defaultValue?: string;
}) {
  return (
    <select
      name="categoryId"
      className="flex h-12 w-full rounded-2xl border border-border bg-input px-4 text-sm text-white"
      defaultValue={defaultValue ?? categories[0]?.id}
    >
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}

function ProductFormFields({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: ProductRecord;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <label className="space-y-2">
        <span className="text-sm text-white">Nazwa</span>
        <Input name="name" defaultValue={product?.name} placeholder="Nowy planner premium" />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Slug</span>
        <Input name="slug" defaultValue={product?.slug} placeholder="nowy-planner-premium" />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Kategoria</span>
        <CategorySelect categories={categories} defaultValue={product?.categoryId} />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Format</span>
        <Input name="format" defaultValue={product?.format ?? "PDF"} placeholder="PDF + workbook" />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Cena</span>
        <Input name="price" type="number" defaultValue={product?.price ?? 79} />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Cena porównawcza</span>
        <Input
          name="compareAtPrice"
          type="number"
          defaultValue={product?.compareAtPrice ?? undefined}
          placeholder="opcjonalnie"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Liczba stron</span>
        <Input name="pages" type="number" defaultValue={product?.pages ?? 0} />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Etykieta sprzedażowa</span>
        <Input
          name="salesLabel"
          defaultValue={product?.salesLabel}
          placeholder="Bestseller w kategorii"
        />
      </label>

      <label className="space-y-2 xl:col-span-2">
        <span className="text-sm text-white">Krótki opis</span>
        <Textarea
          name="shortDescription"
          defaultValue={product?.shortDescription}
          className="min-h-24"
          placeholder="Krótki opis widoczny na kartach produktów..."
        />
      </label>

      <label className="space-y-2 xl:col-span-2">
        <span className="text-sm text-white">Pełny opis</span>
        <Textarea
          name="description"
          defaultValue={product?.description}
          className="min-h-32"
          placeholder="Szczegółowy opis produktu..."
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Hero note</span>
        <Input
          name="heroNote"
          defaultValue={product?.heroNote}
          placeholder="Krótka notatka premium"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Tagi</span>
        <Input
          name="tags"
          defaultValue={product?.tags.join(", ")}
          placeholder="organizacja, planner, premium"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Gradient accent</span>
        <Input name="accent" defaultValue={product?.accent} placeholder="from-amber-300..." />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Gradient okładki</span>
        <Input
          name="coverGradient"
          defaultValue={product?.coverGradient}
          placeholder="from-stone-950..."
        />
      </label>

      <label className="space-y-2 xl:col-span-2">
        <span className="text-sm text-white">Sekcja &quot;co zawiera&quot;</span>
        <Textarea
          name="includes"
          defaultValue={product?.includes.join("\n")}
          className="min-h-24"
          placeholder="Jedna pozycja na linię albo po przecinku"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Okładka produktu</span>
        <Input name="coverFile" type="file" accept="image/png,image/jpeg,image/webp" />
      </label>

      <label className="space-y-2">
        <span className="text-sm text-white">Plik cyfrowy</span>
        <Input
          name="productFile"
          type="file"
          accept=".pdf,.zip,.png,.jpg,.jpeg,.webp,application/pdf,application/zip"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3 xl:col-span-2">
        <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/30 px-4 py-3 text-sm text-white">
          <input
            name="bestseller"
            type="checkbox"
            defaultChecked={product?.bestseller}
            className="size-4 accent-[var(--color-primary)]"
          />
          Bestseller
        </label>
        <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/30 px-4 py-3 text-sm text-white">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={product?.featured}
            className="size-4 accent-[var(--color-primary)]"
          />
          Featured
        </label>
        <label className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/30 px-4 py-3 text-sm text-white">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={product?.isActive ?? true}
            className="size-4 accent-[var(--color-primary)]"
          />
          Aktywny produkt
        </label>
      </div>
    </div>
  );
}

export function AdminProductManager({
  categories,
  products,
}: AdminProductManagerProps) {
  return (
    <div className="space-y-6">
      <section className="surface-panel gold-frame space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-white">Nowy produkt</h2>
          <p className="text-sm text-muted-foreground">
            Formularz zapisuje rekord do bazy i obsługuje upload okładki oraz pliku cyfrowego.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-4 text-sm text-muted-foreground">
            Najpierw dodaj co najmniej jedną kategorię w sekcji admin kategorii.
          </p>
        ) : (
          <form
            action={createProductAction}
            className="space-y-4"
            encType="multipart/form-data"
          >
            <ProductFormFields categories={categories} />
            <AdminSubmitButton
              idleLabel="Utwórz produkt"
              pendingLabel="Tworzenie produktu..."
              className="w-full"
            />
          </form>
        )}
      </section>

      <section className="surface-panel gold-frame space-y-5 p-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-white">Edycja produktów</h2>
          <p className="text-sm text-muted-foreground">
            Możesz aktualizować metadane, pliki, status publikacji i usuwać rekordy.
          </p>
        </div>

        {products.length === 0 ? (
          <p className="rounded-[1.2rem] border border-border/70 bg-secondary/45 px-4 py-4 text-sm text-muted-foreground">
            Nie ma jeszcze żadnych produktów do edycji.
          </p>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <article
                key={product.id}
                className="rounded-[1.4rem] border border-border/70 bg-secondary/45 p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg text-white">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.category} • {product.format} • {product.pages} stron
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-primary/75">
                      {product.coverPath ? "Okładka dodana" : "Brak okładki"} •{" "}
                      {product.filePath ? "Plik dodany" : "Brak pliku"}
                    </p>
                  </div>

                  <details className="w-full max-w-4xl">
                    <summary className="cursor-pointer rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-white">
                      Edytuj produkt
                    </summary>

                    <div className="mt-4 rounded-[1.2rem] border border-border/60 bg-background/20 p-4">
                      <form
                        action={updateProductAction}
                        className="space-y-4"
                        encType="multipart/form-data"
                      >
                        <input type="hidden" name="productId" value={product.id} />
                        <ProductFormFields categories={categories} product={product} />
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <AdminSubmitButton
                            idleLabel="Zapisz zmiany"
                            pendingLabel="Zapisywanie..."
                          />
                        </div>
                      </form>

                      <form action={deleteProductAction} className="mt-3">
                        <input type="hidden" name="productId" value={product.id} />
                        <AdminSubmitButton
                          idleLabel="Usuń produkt"
                          pendingLabel="Usuwanie..."
                          variant="destructive"
                        />
                      </form>
                    </div>
                  </details>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

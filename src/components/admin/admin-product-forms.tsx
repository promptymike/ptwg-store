"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { categoryFormSchema, productFormSchema } from "@/lib/validations/admin";
import { CATEGORY_OPTIONS } from "@/types/store";

export function AdminProductForms() {
  const [productFeedback, setProductFeedback] = useState<string | null>(null);
  const [categoryFeedback, setCategoryFeedback] = useState<string | null>(null);

  function handleProductSubmit(formData: FormData) {
    const result = productFormSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      category: formData.get("category"),
      price: formData.get("price"),
      description: formData.get("description"),
    });

    if (!result.success) {
      setProductFeedback(result.error.issues[0]?.message ?? "Błąd walidacji produktu.");
      return;
    }

    setProductFeedback(
      "Formularz produktu jest poprawny. Tutaj później trafi insert do Supabase.",
    );
  }

  function handleCategorySubmit(formData: FormData) {
    const result = categoryFormSchema.safeParse({
      name: formData.get("categoryName"),
      description: formData.get("categoryDescription"),
    });

    if (!result.success) {
      setCategoryFeedback(
        result.error.issues[0]?.message ?? "Błąd walidacji kategorii.",
      );
      return;
    }

    setCategoryFeedback(
      "Formularz kategorii jest poprawny. Docelowo zapisze kategorię lub jej metadane w bazie.",
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form
        action={handleProductSubmit}
        className="surface-panel gold-frame space-y-5 p-6"
      >
        <div className="space-y-2">
          <h2 className="text-2xl text-white">Dodaj produkt</h2>
          <p className="text-sm text-muted-foreground">
            Placeholder formularza pod admin CRUD z walidacją Zod.
          </p>
        </div>

        <label className="space-y-2">
          <span className="text-sm text-white">Nazwa produktu</span>
          <Input name="name" placeholder="Nowy planner premium" />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-white">Slug</span>
          <Input name="slug" placeholder="nowy-planner-premium" />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-white">Kategoria</span>
          <select
            name="category"
            className="flex h-12 w-full rounded-xl border border-border bg-input px-4 text-sm text-white"
            defaultValue={CATEGORY_OPTIONS[0]}
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-white">Cena</span>
          <Input name="price" placeholder="99" type="number" />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-white">Opis</span>
          <Textarea
            name="description"
            placeholder="Krótki opis produktu premium..."
            className="min-h-32"
          />
        </label>

        <Button type="submit" className="w-full">
          Zapisz placeholder produktu
        </Button>

        {productFeedback ? (
          <p className="rounded-[1.2rem] border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
            {productFeedback}
          </p>
        ) : null}
      </form>

      <form
        action={handleCategorySubmit}
        className="surface-panel gold-frame space-y-5 p-6"
      >
        <div className="space-y-2">
          <h2 className="text-2xl text-white">Formularz kategorii</h2>
          <p className="text-sm text-muted-foreground">
            MVP trzyma kategorie statycznie, ale formularz już waliduje dane.
          </p>
        </div>

        <label className="space-y-2">
          <span className="text-sm text-white">Nazwa kategorii</span>
          <select
            name="categoryName"
            className="flex h-12 w-full rounded-xl border border-border bg-input px-4 text-sm text-white"
            defaultValue={CATEGORY_OPTIONS[0]}
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-white">Opis kategorii</span>
          <Textarea
            name="categoryDescription"
            placeholder="Opis i pozycjonowanie kategorii..."
            className="min-h-36"
          />
        </label>

        <Button type="submit" variant="outline" className="w-full">
          Zapisz placeholder kategorii
        </Button>

        {categoryFeedback ? (
          <p className="rounded-[1.2rem] border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
            {categoryFeedback}
          </p>
        ) : null}
      </form>
    </div>
  );
}

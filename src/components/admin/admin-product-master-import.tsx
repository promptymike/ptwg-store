"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSpreadsheet } from "lucide-react";

import { importProductMasterAction } from "@/app/admin/actions";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  getRequiredProductMasterColumns,
  parseProductMasterCsv,
  type ProductMasterCategory,
  type ProductMasterParsedRow,
} from "@/lib/product-master";
import { formatCurrency, formatProductStatus } from "@/lib/format";

type AdminProductMasterImportProps = {
  categories: ProductMasterCategory[];
  existingProducts: Array<{
    slug: string;
    name: string;
    status: string;
  }>;
};

const SAMPLE_CSV = `name,slug,short_description,long_description,category,price,compare_at_price,badge,status,seo_title,seo_description,cover_image_path,product_file_path,preview_images
System planowania tygodnia,system-planowania-tygodnia,"Planer, ktory porzadkuje tydzien i priorytety w jednym widoku.","Gotowy system planowania tygodnia dla osob, ktore chca szybciej wybierac priorytety i domykac zadania bez chaosu.",planery,79,119,new,draft,System planowania tygodnia,Gotowy planer tygodniowy do organizacji priorytetow.,products/system/covers/cover.webp,products/system/files/system.pdf,products/system/previews/01.webp|products/system/previews/02.webp`;

function readFileText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Nie udało się odczytać pliku CSV."));
    reader.readAsText(file);
  });
}

function RowStateBadge({ row }: { row: ProductMasterParsedRow }) {
  if (row.errors.length > 0) {
    return (
      <span className="inline-flex rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-destructive">
        Błąd
      </span>
    );
  }

  if (row.warnings.length > 0) {
    return (
      <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-500">
        Ostrzeżenie
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-500">
      Gotowy
    </span>
  );
}

export function AdminProductMasterImport({
  categories,
  existingProducts,
}: AdminProductMasterImportProps) {
  const [csvText, setCsvText] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  const existingSlugs = useMemo(
    () => new Set(existingProducts.map((product) => product.slug)),
    [existingProducts],
  );

  const parsed = useMemo(
    () =>
      csvText.trim()
        ? parseProductMasterCsv({
            csvText,
            categories,
            existingSlugs,
          })
        : { rows: [], missingColumns: [] },
    [categories, csvText, existingSlugs],
  );

  const validRows = parsed.rows.filter((row) => row.errors.length === 0);
  const invalidRows = parsed.rows.length - validRows.length;
  const importPayload = JSON.stringify(validRows.map((row) => row.values));
  const canImport =
    parsed.missingColumns.length === 0 && validRows.length > 0 && categories.length > 0;

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileError(null);

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileError("Wybierz plik CSV wyeksportowany z Google Sheets.");
      return;
    }

    try {
      setCsvText(await readFileText(file));
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Nie udało się odczytać CSV.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel space-y-5 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="eyebrow">Product Master</span>
            <h2 className="text-3xl text-foreground">Bulk import z CSV</h2>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Wgraj CSV z Google Sheets, zobacz preview i zaimportuj tylko poprawne,
              nowe produkty. Istniejące slugi są blokowane, więc import niczego nie
              nadpisuje.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">
              Kategorie: {categories.length}
            </span>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1">
              Istniejące produkty: {existingProducts.length}
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 p-6 text-center transition hover:border-primary/30">
            <FileSpreadsheet className="size-8 text-primary" />
            <span className="mt-3 text-sm font-medium text-foreground">
              Wgraj CSV z Product Master
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              CSV UTF-8, do ok. 10 MB. Google Sheets: File {"→"} Download {"→"} CSV.
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">
              Albo wklej CSV ręcznie
            </span>
            <Textarea
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              className="min-h-48 font-mono text-xs"
              placeholder={SAMPLE_CSV}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setCsvText(SAMPLE_CSV)}>
            Wstaw przykład
          </Button>
          <Button type="button" variant="ghost" onClick={() => setCsvText("")}>
            Wyczyść
          </Button>
        </div>

        {fileError ? (
          <div className="rounded-[1.3rem] border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {fileError}
          </div>
        ) : null}

        {parsed.missingColumns.length > 0 ? (
          <div className="rounded-[1.3rem] border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground">
            <p className="font-medium text-destructive">Brakuje kolumn:</p>
            <p className="mt-2 break-words text-muted-foreground">
              {parsed.missingColumns.join(", ")}
            </p>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-[1.3rem] border border-border/70 bg-background/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/75">Wiersze</p>
          <p className="mt-3 text-3xl text-foreground">{parsed.rows.length}</p>
        </article>
        <article className="rounded-[1.3rem] border border-border/70 bg-background/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/75">Gotowe</p>
          <p className="mt-3 text-3xl text-foreground">{validRows.length}</p>
        </article>
        <article className="rounded-[1.3rem] border border-border/70 bg-background/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/75">Z błędami</p>
          <p className="mt-3 text-3xl text-foreground">{invalidRows}</p>
        </article>
        <article className="rounded-[1.3rem] border border-border/70 bg-background/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-primary/75">Kolumny</p>
          <p className="mt-3 text-3xl text-foreground">
            {getRequiredProductMasterColumns().length}
          </p>
        </article>
      </section>

      {parsed.rows.length > 0 ? (
        <section className="surface-panel space-y-5 p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl text-foreground">Preview importu</h2>
              <p className="text-sm text-muted-foreground">
                Import utworzy tylko wiersze oznaczone jako Gotowy lub Ostrzeżenie.
                Wiersze z błędami zostaną pominięte.
              </p>
            </div>

            {canImport ? (
              <form action={importProductMasterAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input type="hidden" name="rowsJson" value={importPayload} />
                <label className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    name="confirmNoOverwrite"
                    className="size-4 accent-[var(--color-foreground)]"
                  />
                  Tylko nowe produkty, bez overwrite
                </label>
                <AdminSubmitButton
                  idleLabel={`Importuj ${validRows.length}`}
                  pendingLabel="Importowanie..."
                  className="shrink-0"
                />
              </form>
            ) : (
              <Button type="button" disabled>
                Importuj 0
              </Button>
            )}
          </div>

          {!canImport ? (
            <div className="flex items-start gap-3 rounded-[1.3rem] border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-muted-foreground">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <p>
                Import jest zablokowany, dopóki CSV nie ma wymaganych kolumn,
                poprawnych kategorii i co najmniej jednego poprawnego nowego produktu.
              </p>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Row</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Produkt</th>
                  <th className="px-3 py-3">Kategoria</th>
                  <th className="px-3 py-3">Cena</th>
                  <th className="px-3 py-3">Storefront</th>
                  <th className="px-3 py-3">Assety</th>
                  <th className="px-3 py-3">Uwagi</th>
                </tr>
              </thead>
              <tbody>
                {parsed.rows.map((row) => (
                  <tr key={row.rowNumber} className="border-t border-border/70">
                    <td className="px-3 py-4 text-muted-foreground">{row.rowNumber}</td>
                    <td className="px-3 py-4">
                      <RowStateBadge row={row} />
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium text-foreground">{row.values.name}</p>
                      <p className="text-xs text-muted-foreground">/{row.values.slug}</p>
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {row.values.category}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {formatCurrency(row.values.price)}
                      {row.values.compareAtPrice ? (
                        <span className="ml-2 line-through">
                          {formatCurrency(row.values.compareAtPrice)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {formatProductStatus(row.values.status)}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        {row.values.coverImagePath ? (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="size-4 text-amber-500" />
                        )}
                        cover
                      </span>
                      <span className="ml-3 inline-flex items-center gap-1">
                        {row.values.productFilePath ? (
                          <CheckCircle2 className="size-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="size-4 text-amber-500" />
                        )}
                        file
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="max-w-md space-y-1 text-xs">
                        {row.errors.map((error) => (
                          <p key={error} className="text-destructive">
                            {error}
                          </p>
                        ))}
                        {row.warnings.map((warning) => (
                          <p key={warning} className="text-amber-500">
                            {warning}
                          </p>
                        ))}
                        {row.errors.length === 0 && row.warnings.length === 0 ? (
                          <p className="text-muted-foreground">OK</p>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

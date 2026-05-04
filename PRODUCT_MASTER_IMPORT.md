# Product Master CSV import

## Admin flow

1. Open `/admin/product-master`.
2. Upload a CSV exported from Google Sheets or paste CSV text.
3. Review the preview table:
   - `Gotowy` rows can be imported.
   - `Ostrzezenie` rows can be imported but should be checked.
   - `Blad` rows are skipped and show the exact reason.
4. Check `Tylko nowe produkty, bez overwrite`.
5. Click `Importuj`.

## Required CSV columns

```csv
name,slug,short_description,long_description,category,price,compare_at_price,badge,status,seo_title,seo_description,cover_image_path,product_file_path,preview_images
```

Aliases such as `SEO title`, `SEO description`, `cover_url`, `file_path` and `previews` are accepted.

## Validation rules

- `slug` must be lowercase letters, digits and hyphens.
- `category` must match an existing category name or slug.
- `status` must be `draft`, `published` or `archived`.
- Existing slugs are blocked. The importer never overwrites existing products.
- Published products need both a cover and a product file path.
- Product file references must be private Supabase `product-files` paths or Supabase Storage URLs that can be normalized to a path.
- Cover and preview references can be Supabase `product-covers` paths or external image URLs.

## Asset path format

Recommended:

```csv
products/my-product/covers/cover.webp
products/my-product/files/product.pdf
products/my-product/previews/01.webp|products/my-product/previews/02.webp
```

`preview_images` supports `|`, `;` or new lines inside a quoted CSV cell.

## Manual test

1. Run migrations:
   ```bash
   supabase db push
   ```
2. Create a category if the target category does not exist.
3. Upload a CSV with one draft row and one intentionally invalid duplicate slug.
4. Confirm the preview shows one importable row and one clear duplicate-slug error.
5. Import and verify:
   - `/admin/produkty` shows the new product.
   - draft products are not visible on the storefront.
   - published products are visible only when `status=published` and required assets are present.

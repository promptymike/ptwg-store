import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.vercel.tmp", "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("=");
      const key = line.slice(0, idx);
      let value = line.slice(idx + 1);
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      value = value.replace(/\\n/g, "").trim();
      return [key, value];
    }),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = env.NEXT_PUBLIC_SITE_URL ?? "https://templify.pl";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing Supabase env in .env.vercel.tmp");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const { data: products, error } = await supabase
  .from("products")
  .select("id, slug, name")
  .eq("status", "published")
  .order("name");

if (error) {
  console.error("Failed to list products:", error);
  process.exit(1);
}

console.log(`Processing ${products.length} products`);

for (const product of products) {
  // Skip if previews already exist so the script is idempotent.
  const { data: existing } = await supabase
    .from("product_previews")
    .select("id")
    .eq("product_id", product.id);
  if (existing && existing.length > 0) {
    console.log(`SKIP ${product.slug} — already has ${existing.length} previews`);
    continue;
  }

  // Reuse the OG image as a starter preview. The admin can replace it
  // later with real ebook screenshots through /admin/produkty/[slug].
  const productPage = await fetch(`${SITE_URL}/produkty/${product.slug}`);
  const html = await productPage.text();
  const ogMatch = html.match(/opengraph-image[^"\\]+/);
  if (!ogMatch) {
    console.error(`  ! ${product.slug} — no opengraph url in page html`);
    continue;
  }
  const ogUrl = `${SITE_URL}/produkty/${product.slug}/${ogMatch[0]}`;
  const response = await fetch(ogUrl);
  if (!response.ok) {
    console.error(`  ! ${product.slug} — ${response.status}`);
    continue;
  }
  const buffer = Buffer.from(await response.arrayBuffer());

  const filename = `${Date.now()}-${product.slug}-preview.png`;
  const path = `products/${product.id}/previews/${filename}`;

  const upload = await supabase.storage
    .from("product-covers")
    .upload(path, buffer, { contentType: "image/png", upsert: true });

  if (upload.error) {
    console.error(`  ! upload failed: ${upload.error.message}`);
    continue;
  }

  const { error: insertError } = await supabase
    .from("product_previews")
    .insert({
      product_id: product.id,
      storage_path: path,
      alt_text: `${product.name} — wnętrze produktu`,
      sort_order: 0,
    });

  if (insertError) {
    console.error(`  ! db insert failed: ${insertError.message}`);
    continue;
  }
  console.log(`  ✓ ${product.slug} preview added at ${path}`);
}

console.log("Done.");

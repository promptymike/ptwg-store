import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

// Read Vercel env locally so we don't hardcode credentials.
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
      // Vercel CLI sometimes appends a literal \n inside the quotes when
      // the original env was pasted with a trailing newline. Trim that
      // and any other whitespace so the JWT verifies cleanly.
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

const { data: products, error: productsError } = await supabase
  .from("products")
  .select("id, slug, name, cover_path")
  .eq("status", "published")
  .order("name");

if (productsError) {
  console.error("Failed to list products:", productsError);
  process.exit(1);
}

console.log(`Processing ${products.length} products`);

for (const product of products) {
  if (product.cover_path) {
    console.log(`SKIP ${product.slug} — already has cover at ${product.cover_path}`);
    continue;
  }

  // Next.js hashes the opengraph-image URL (e.g. /opengraph-image-jjgr8l?ab12).
  // Pull the actual hashed URL from the product page HTML so we always hit
  // the served asset rather than the convention name.
  const productPage = await fetch(`${SITE_URL}/produkty/${product.slug}`);
  if (!productPage.ok) {
    console.error(`  ! product page ${productPage.status}`);
    continue;
  }
  const productHtml = await productPage.text();
  const ogMatch = productHtml.match(/opengraph-image[^"\\]+/);
  if (!ogMatch) {
    console.error(`  ! no opengraph-image URL in page HTML`);
    continue;
  }
  const ogUrl = `${SITE_URL}/produkty/${product.slug}/${ogMatch[0]}`;
  console.log(`FETCH ${product.slug} ← ${ogUrl}`);
  const response = await fetch(ogUrl);
  if (!response.ok) {
    console.error(`  ! ${response.status} ${response.statusText}`);
    continue;
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  console.log(`  ← ${buffer.length} bytes`);

  const filename = `${Date.now()}-${product.slug}.png`;
  const path = `products/${product.id}/covers/${filename}`;

  const upload = await supabase.storage
    .from("product-covers")
    .upload(path, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (upload.error) {
    console.error(`  ! upload failed: ${upload.error.message}`);
    continue;
  }
  console.log(`  ↑ uploaded to ${path}`);

  const { error: updateError } = await supabase
    .from("products")
    .update({ cover_path: path })
    .eq("id", product.id);

  if (updateError) {
    console.error(`  ! db update failed: ${updateError.message}`);
    continue;
  }
  console.log(`  ✓ ${product.slug} cover_path saved`);
}

console.log("Done.");

// Generates branded 16:9 cover images for blog posts (Playwright renders an
// HTML tile), uploads them to the product-covers bucket and points
// blog_posts.cover_path at them.
//
// Usage: node scripts/generate-blog-covers.mjs

import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SECRET_KEY,
);

const COVERS = [
  {
    slug: "jak-ogarnac-budzet-domowy",
    tag: "Finanse osobiste",
    title: "Jak ogarnąć budżet domowy",
    subtitle: "Prosty system, który naprawdę utrzymasz",
    emoji: "💰",
    accent: "#2f8f6b",
    accentSoft: "rgba(47,143,107,.16)",
  },
  {
    slug: "planowanie-posilkow-na-tydzien",
    tag: "Dom i posiłki",
    title: "Planowanie posiłków na tydzień",
    subtitle: "Krok po kroku + gotowa lista zakupów",
    emoji: "🍽️",
    accent: "#b0542d",
    accentSoft: "rgba(176,84,45,.14)",
  },
  {
    slug: "organizacja-tygodnia-w-rodzinie",
    tag: "Rodzina",
    title: "Organizacja tygodnia w rodzinie",
    subtitle: "Jeden kalendarz zamiast chaosu karteczek",
    emoji: "🗓️",
    accent: "#3f6fae",
    accentSoft: "rgba(63,111,174,.14)",
  },
];

function tileHtml({ tag, title, subtitle, emoji, accent, accentSoft }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{width:1200px;height:675px;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;
    background:#f1ede4;position:relative;overflow:hidden;color:#14110c;}
  .blob{position:absolute;border-radius:50%;filter:blur(70px);}
  .b1{width:560px;height:560px;right:-140px;top:-180px;background:${accentSoft};}
  .b2{width:420px;height:420px;left:-120px;bottom:-200px;background:rgba(226,188,114,.22);}
  .grid{position:absolute;inset:0;background:
    linear-gradient(rgba(20,17,12,.045) 1px,transparent 1px),
    linear-gradient(90deg,rgba(20,17,12,.045) 1px,transparent 1px);
    background-size:56px 56px;
    mask-image:linear-gradient(to bottom,black,transparent 85%);}
  .inner{position:relative;height:100%;padding:72px 84px;display:flex;flex-direction:column;justify-content:space-between;}
  .tag{display:inline-flex;align-items:center;gap:12px;font-size:22px;font-weight:800;
    letter-spacing:.22em;text-transform:uppercase;color:${accent};}
  .tag::before{content:'';width:34px;height:3px;background:${accent};border-radius:2px;}
  h1{font-size:88px;line-height:1.02;letter-spacing:-.035em;font-weight:800;max-width:900px;text-wrap:balance;}
  .sub{margin-top:26px;font-size:32px;color:rgba(20,17,12,.62);max-width:820px;}
  .foot{display:flex;align-items:center;justify-content:space-between;}
  .brand{display:flex;align-items:center;gap:14px;font-size:26px;font-weight:700;}
  .dot{width:40px;height:40px;border-radius:999px;background:#b9763a;color:#fff;display:flex;
    align-items:center;justify-content:center;font-weight:800;font-size:20px;}
  .emoji{font-size:120px;position:absolute;right:84px;bottom:56px;filter:drop-shadow(0 18px 30px rgba(20,17,12,.18));}
  </style></head><body>
  <div class="blob b1"></div><div class="blob b2"></div><div class="grid"></div>
  <div class="inner">
    <div><span class="tag">${tag}</span><h1 style="margin-top:34px">${title}</h1><p class="sub">${subtitle}</p></div>
    <div class="foot"><span class="brand"><span class="dot">T</span>templify.pl / blog</span></div>
  </div>
  <div class="emoji">${emoji}</div>
  </body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 2 });

for (const cover of COVERS) {
  await page.setContent(tileHtml(cover), { waitUntil: "networkidle" });
  const buffer = await page.screenshot({ type: "jpeg", quality: 84 });
  const path = `blog/${cover.slug}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("product-covers")
    .upload(path, buffer, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw new Error(`upload ${path}: ${uploadError.message}`);

  const { error: dbError } = await supabase
    .from("blog_posts")
    .update({ cover_path: path })
    .eq("slug", cover.slug);
  if (dbError) throw new Error(`db ${cover.slug}: ${dbError.message}`);

  console.log(`✓ ${cover.slug} → ${path}`);
}

await browser.close();

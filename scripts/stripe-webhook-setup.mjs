import "dotenv/config";
import Stripe from "stripe";
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
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      return [key, value];
    }),
);

const sk = env.STRIPE_SECRET_KEY;
if (!sk) throw new Error("STRIPE_SECRET_KEY missing in .env.vercel.tmp");

const stripe = new Stripe(sk);
const target = "https://templify.pl/api/stripe/webhook";
const events = ["checkout.session.completed"];

const action = process.argv[2] ?? "list";

if (action === "list") {
  const list = await stripe.webhookEndpoints.list({ limit: 100 });
  console.log(`Existing endpoints (${list.data.length}):`);
  for (const w of list.data) {
    console.log(
      `- ${w.id} url=${w.url} status=${w.status} events=${(w.enabled_events ?? []).join(",")}`,
    );
  }
} else if (action === "ensure") {
  const list = await stripe.webhookEndpoints.list({ limit: 100 });
  const match = list.data.find((w) => w.url === target);
  if (match) {
    console.log(`Already exists: ${match.id} (status=${match.status})`);
    if (
      JSON.stringify((match.enabled_events ?? []).sort()) !==
      JSON.stringify(events.slice().sort())
    ) {
      console.log("Updating events to:", events);
      const updated = await stripe.webhookEndpoints.update(match.id, {
        enabled_events: events,
      });
      console.log(`Updated. status=${updated.status}`);
    }
    console.log(
      "NOTE: secret cannot be re-read from API — keep your existing STRIPE_WEBHOOK_SECRET.",
    );
  } else {
    const created = await stripe.webhookEndpoints.create({
      url: target,
      enabled_events: events,
      description: "Templify storefront — fulfills paid orders",
    });
    console.log(`Created: ${created.id}`);
    console.log(`SECRET: ${created.secret}`);
  }
} else {
  console.error("Usage: node scripts/stripe-webhook-setup.mjs list|ensure");
  process.exit(1);
}

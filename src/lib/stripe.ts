import Stripe from "stripe";

import { env } from "@/lib/env";

let stripeClient: Stripe | null | undefined;

export function getStripeServerClient() {
  if (!env.stripeSecretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
    });
  }

  return stripeClient;
}

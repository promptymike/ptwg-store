import { NextResponse } from "next/server";
import Stripe from "stripe";

import { env, getMissingStripeWebhookEnv } from "@/lib/env";
import { getStripeServerClient } from "@/lib/stripe";
import { fulfillCheckoutSession } from "@/lib/stripe/fulfillment";
import { fulfillGiftPurchase } from "@/lib/stripe/gift-fulfillment";

export async function POST(request: Request) {
  const missingEnv = getMissingStripeWebhookEnv();

  if (missingEnv.length > 0) {
    return NextResponse.json(
      {
        message: `Brakuje konfiguracji webhooka Stripe: ${missingEnv.join(", ")}.`,
      },
      { status: 500 },
    );
  }

  const stripe = getStripeServerClient();

  if (!stripe || !env.stripeWebhookSecret) {
    return NextResponse.json(
      { message: "Nie udało się zainicjalizować webhooka Stripe." },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { message: "Brakuje nagłówka stripe-signature." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.stripeWebhookSecret,
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Nie udało się zweryfikować podpisu webhooka.",
      },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Two product flows live behind the same webhook: regular ebook /
      // bundle purchases and gift voucher purchases. The voucher flow
      // doesn't create an order, so we branch on metadata.kind.
      if (session.metadata?.kind === "gift_voucher") {
        await fulfillGiftPurchase(session.id);
      } else {
        await fulfillCheckoutSession(session.id, {
          eventId: event.id,
          eventType: event.type,
        });
      }
    } catch (error) {
      return NextResponse.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "Nie udało się zrealizować zamówienia.",
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}

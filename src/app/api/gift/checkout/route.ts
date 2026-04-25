import { NextResponse } from "next/server";
import { z } from "zod";

import { env, getMissingStripeCheckoutEnv } from "@/lib/env";
import {
  GIFT_CODE_MAX,
  GIFT_CODE_MIN,
} from "@/lib/gift-constants";
import { getStripeServerClient } from "@/lib/stripe";

const giftCheckoutSchema = z.object({
  amountPln: z
    .number({ message: "Kwota jest wymagana." })
    .int()
    .min(GIFT_CODE_MIN, `Minimum to ${GIFT_CODE_MIN} zł.`)
    .max(GIFT_CODE_MAX, `Maksimum to ${GIFT_CODE_MAX} zł.`),
  purchaserEmail: z.string().trim().toLowerCase().email(),
  recipientEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .optional()
    .or(z.literal(""))
    .nullable()
    .transform((value) => (value ? value : null)),
  recipientName: z
    .string()
    .trim()
    .max(80)
    .optional()
    .or(z.literal(""))
    .nullable()
    .transform((value) => (value ? value : null)),
  message: z
    .string()
    .trim()
    .max(400)
    .optional()
    .or(z.literal(""))
    .nullable()
    .transform((value) => (value ? value : null)),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = giftCheckoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Niepoprawne dane.",
        code: "validation_error",
      },
      { status: 400 },
    );
  }

  const missingEnv = getMissingStripeCheckoutEnv();
  if (missingEnv.length > 0) {
    return NextResponse.json(
      { message: "Płatności są chwilowo niedostępne.", code: "stripe_env_missing" },
      { status: 503 },
    );
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return NextResponse.json(
      { message: "Brak klienta Stripe.", code: "stripe_init_failed" },
      { status: 500 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${env.siteUrl}/podarunek/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.siteUrl}/podarunek/anulowano`,
      customer_email: parsed.data.purchaserEmail,
      locale: "pl",
      billing_address_collection: "required",
      metadata: {
        kind: "gift_voucher",
        amount_pln: String(parsed.data.amountPln),
        purchaser_email: parsed.data.purchaserEmail,
        recipient_email: parsed.data.recipientEmail ?? "",
        recipient_name: parsed.data.recipientName ?? "",
        gift_message: parsed.data.message ?? "",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: parsed.data.amountPln * 100,
            product_data: {
              name: `Voucher Templify ${parsed.data.amountPln} zł`,
              description:
                "Karta podarunkowa do wykorzystania na dowolny ebook lub pakiet w sklepie templify.pl.",
            },
          },
        },
      ],
    });

    if (!session.url) {
      return NextResponse.json(
        { message: "Stripe nie zwrócił adresu sesji.", code: "session_url_missing" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Nie udało się utworzyć sesji płatności.",
        code: "session_create_failed",
      },
      { status: 502 },
    );
  }
}

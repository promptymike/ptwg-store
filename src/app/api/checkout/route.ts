import { NextResponse } from "next/server";

import { checkoutSchema } from "@/lib/validations/catalog";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = checkoutSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        status: "Błąd walidacji",
        message: parsed.error.issues[0]?.message ?? "Niepoprawne dane checkoutu.",
      },
      { status: 400 },
    );
  }

  const orderId = `PTWG-${Date.now().toString().slice(-6)}`;

  return NextResponse.json({
    status: "Sukces",
    orderId,
    message:
      "Mock checkout zakończony pomyślnie. W kolejnej iteracji ta odpowiedź zostanie zastąpiona sesją Stripe Checkout.",
  });
}

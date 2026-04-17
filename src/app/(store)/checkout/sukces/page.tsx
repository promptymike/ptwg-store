import { redirect } from "next/navigation";

import { CheckoutSuccessClient } from "@/components/checkout/checkout-success-client";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import {
  fulfillCheckoutSession,
  type CheckoutFulfillmentResult,
} from "@/lib/stripe/fulfillment";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/logowanie?next=/checkout/sukces");
  }

  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <div className="shell section-space">
        <EmptyState
          badge="Checkout"
          title="Brakuje identyfikatora sesji"
          description="Stripe nie przekazał identyfikatora Checkout Session w adresie sukcesu. Wróć do koszyka i spróbuj ponownie."
          action={{ href: "/koszyk", label: "Wróć do koszyka" }}
        />
      </div>
    );
  }

  let result: CheckoutFulfillmentResult | null = null;
  let errorMessage: string | null = null;

  try {
    result = await fulfillCheckoutSession(sessionId);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Webhook Stripe powinien nadal zapisać zamówienie i bibliotekę. Odśwież konto lub bibliotekę za chwilę.";
  }

  if (!result) {
    return (
      <div className="shell section-space">
        <EmptyState
          badge="Checkout"
          title="Płatność została zakończona, ale nie udało się odświeżyć widoku"
          description={errorMessage ?? "Odśwież bibliotekę za chwilę."}
          action={{ href: "/biblioteka", label: "Przejdź do biblioteki" }}
        />
      </div>
    );
  }

  if (result.userId !== user.id) {
    redirect("/konto");
  }

  return (
    <div className="shell section-space">
      <CheckoutSuccessClient
        orderId={result.orderId}
        amount={formatCurrency(result.total)}
        email={result.email}
        itemCount={result.items.length}
      />
    </div>
  );
}

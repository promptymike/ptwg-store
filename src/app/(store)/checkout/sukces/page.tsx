import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CheckoutSuccessClient } from "@/components/checkout/checkout-success-client";
import { ProductCard } from "@/components/products/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatOrderNumber } from "@/lib/format";
import { getCurrentUser } from "@/lib/session";
import {
  fulfillCheckoutSession,
  type CheckoutFulfillmentResult,
} from "@/lib/stripe/fulfillment";
import {
  getOwnedProductIds,
  getRecommendedProducts,
} from "@/lib/supabase/store";

export const metadata: Metadata = {
  title: "Dziękujemy za zakup",
  robots: {
    index: false,
    follow: false,
  },
};

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
    console.error("[checkout-success] fulfillment-failed", {
      sessionId,
      userId: user.id,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
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

  const ownedIds = await getOwnedProductIds(user.id);
  const recommended = await getRecommendedProducts(
    ownedIds,
    result.items.map((item) => item.productId),
    3,
  );

  return (
    <div className="shell section-space space-y-10">
      <CheckoutSuccessClient
        orderId={result.orderId}
        orderNumber={formatOrderNumber(result.orderId)}
        amount={formatCurrency(result.total)}
        email={result.email}
        itemCount={result.items.length}
      />

      {recommended.length > 0 ? (
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-primary/75">
              Polecane przez nas
            </p>
            <h2 className="text-3xl text-foreground sm:text-4xl">
              Klienci dokupują też te ebooki
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              Dobrane do tego, co już masz w bibliotece. Dorzucisz do koszyka
              jednym kliknięciem — wszystkie pliki trafiają tam, gdzie reszta.
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {recommended.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isOwned={ownedIds.has(product.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

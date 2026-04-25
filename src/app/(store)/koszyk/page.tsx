import type { Metadata } from "next";

import { CartView } from "@/components/cart/cart-view";
import { SectionHeading } from "@/components/shared/section-heading";

export const metadata: Metadata = {
  title: "Koszyk",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <div className="shell section-space space-y-8">
      <SectionHeading
        as="h1"
        badge="Twój koszyk"
        title="Zestaw produktów, który za chwilę trafi do Twojej biblioteki"
        description="Przejrzyj wybrane szablony, edytuj ilości i przejdź do bezpiecznej płatności. Wszystkie produkty są cyfrowe — dostaniesz do nich dostęp natychmiast po zakupie."
      />
      <CartView />
    </div>
  );
}

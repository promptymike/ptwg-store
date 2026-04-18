import { CartView } from "@/components/cart/cart-view";
import { SectionHeading } from "@/components/shared/section-heading";

export default function CartPage() {
  return (
    <div className="shell section-space space-y-8">
      <SectionHeading
        badge="Twój koszyk"
        title="Zestaw produktów, który za chwilę trafi do Twojej biblioteki"
        description="Przejrzyj wybrane szablony, edytuj ilości i przejdź do bezpiecznej płatności. Wszystkie produkty są cyfrowe — dostaniesz do nich dostęp natychmiast po zakupie."
      />
      <CartView />
    </div>
  );
}

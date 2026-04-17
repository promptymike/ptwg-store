import { CartView } from "@/components/cart/cart-view";
import { SectionHeading } from "@/components/shared/section-heading";

export default function CartPage() {
  return (
    <div className="shell section-space space-y-8">
      <SectionHeading
        badge="Koszyk"
        title="Twój zestaw produktów cyfrowych"
        description="Koszyk działa lokalnie i zapisuje się w localStorage. To bezpieczny etap przejściowy przed spięciem z prawdziwą sesją użytkownika."
      />
      <CartView />
    </div>
  );
}

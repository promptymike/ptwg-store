import { CartView } from "@/components/cart/cart-view";
import { SectionHeading } from "@/components/shared/section-heading";

export default function CartPage() {
  return (
    <div className="shell section-space space-y-8">
      <SectionHeading
        badge="Koszyk"
        title="Twój zestaw produktów cyfrowych"
        description="Koszyk działa lokalnie i zapisuje się w localStorage, a checkout prowadzi do prawdziwej płatności Stripe przypisanej do zalogowanego konta."
      />
      <CartView />
    </div>
  );
}

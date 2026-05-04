import type { Metadata } from "next";

import { CheckoutAuthGate } from "@/components/checkout/checkout-auth-gate";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { getCurrentUser } from "@/lib/session";
import { getCheckoutOrderBumpSnapshot } from "@/lib/supabase/store";

export const metadata: Metadata = {
  title: "Checkout",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage() {
  const [user, orderBump] = await Promise.all([
    getCurrentUser(),
    getCheckoutOrderBumpSnapshot(),
  ]);

  if (!user) {
    return (
      <div className="shell section-space">
        <CheckoutAuthGate />
      </div>
    );
  }

  return (
    <div className="shell section-space">
      <CheckoutClient initialEmail={user.email ?? ""} orderBump={orderBump} />
    </div>
  );
}

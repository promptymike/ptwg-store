import type { Metadata } from "next";

import { CheckoutAuthGate } from "@/components/checkout/checkout-auth-gate";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Checkout | Templify",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="shell section-space">
        <CheckoutAuthGate />
      </div>
    );
  }

  return (
    <div className="shell section-space">
      <CheckoutClient initialEmail={user.email ?? ""} />
    </div>
  );
}

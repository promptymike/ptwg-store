import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
    redirect("/logowanie?next=/checkout");
  }

  return (
    <div className="shell section-space">
      <CheckoutClient initialEmail={user.email ?? ""} />
    </div>
  );
}

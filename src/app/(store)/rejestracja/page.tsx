import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { getCurrentProfile } from "@/lib/session";

export const metadata: Metadata = {
  title: "Rejestracja",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RegisterPage() {
  const profile = await getCurrentProfile();

  if (profile) {
    redirect("/konto");
  }

  return (
    <div className="shell section-space">
      <AuthCard mode="register" />
    </div>
  );
}

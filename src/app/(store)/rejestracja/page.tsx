import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { getCurrentProfile } from "@/lib/session";

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

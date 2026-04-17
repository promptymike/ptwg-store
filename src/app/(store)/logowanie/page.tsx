import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { getCurrentProfile } from "@/lib/session";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(resolvedSearchParams.next ?? "/konto");
  }

  return (
    <div className="shell section-space">
      <AuthCard mode="login" nextPath={resolvedSearchParams.next ?? "/konto"} />
    </div>
  );
}

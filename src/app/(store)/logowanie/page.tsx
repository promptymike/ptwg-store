import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { getCurrentProfile } from "@/lib/session";

export const metadata: Metadata = {
  title: "Logowanie",
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    auth_error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const profile = await getCurrentProfile();

  if (profile) {
    redirect(resolvedSearchParams.next ?? "/konto");
  }

  const rawAuthError = resolvedSearchParams.auth_error?.trim();
  const initialFeedback = rawAuthError
    ? `Link z maila nie mógł zostać zweryfikowany (${rawAuthError}). Zaloguj się ręcznie lub poproś o wysłanie nowego linku.`
    : null;

  return (
    <div className="shell section-space">
      <AuthCard
        mode="login"
        nextPath={resolvedSearchParams.next ?? "/konto"}
        initialFeedback={initialFeedback}
      />
    </div>
  );
}

import { MockAuthCard } from "@/components/auth/mock-auth-card";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="shell section-space">
      <MockAuthCard mode="login" nextPath={resolvedSearchParams.next ?? "/konto"} />
    </div>
  );
}

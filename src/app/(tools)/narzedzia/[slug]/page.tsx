import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { PlannerWorkspace } from "@/components/planners/planner-workspace";
import { getInteractivePlanner } from "@/data/interactive-planners";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type OwnedPlannerPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: OwnedPlannerPageProps): Promise<Metadata> {
  const { slug } = await params;
  const planner = getInteractivePlanner(slug);

  if (!planner) {
    return {
      title: "Planer",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${planner.name} — mój interaktywny planer`,
    robots: { index: false, follow: false },
  };
}

export default async function OwnedPlannerPage({ params }: OwnedPlannerPageProps) {
  const { slug } = await params;
  const planner = getInteractivePlanner(slug);
  if (!planner) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: auth } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
  if (!auth.user) redirect(`/logowanie?next=${encodeURIComponent(`/narzedzia/${slug}`)}`);
  const { data: access } = await supabase!.from("library_items").select("id").eq("user_id", auth.user.id).eq("product_id", planner.id).maybeSingle();
  if (!access) redirect(`/planery/${slug}?dostep=brak`);

  return <PlannerWorkspace planner={planner} />;
}

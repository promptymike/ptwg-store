import { notFound, redirect } from "next/navigation";

import { PlannerWorkspace } from "@/components/planners/planner-workspace";
import { getInteractivePlanner } from "@/data/interactive-planners";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function OwnedPlannerPage({ params }: { params: Promise<{ slug: string }> }) {
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

import { notFound } from "next/navigation";

import { PlannerWorkspace } from "@/components/planners/planner-workspace";
import { getInteractivePlanner, interactivePlanners } from "@/data/interactive-planners";

export function generateStaticParams() {
  return interactivePlanners.map(({ slug }) => ({ slug }));
}

export default async function PlannerDemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const planner = getInteractivePlanner(slug);
  if (!planner) notFound();
  return <PlannerWorkspace planner={planner} demo />;
}

"use client";

import { useEffect } from "react";

import { useAnalytics } from "@/components/analytics/analytics-provider";

type AnalyticsProductViewProps = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
};

export function AnalyticsProductView({
  id,
  slug,
  name,
  category,
  price,
}: AnalyticsProductViewProps) {
  const { track } = useAnalytics();

  useEffect(() => {
    track("view_product", {
      productId: id,
      slug,
      name,
      category,
      price,
    });
  }, [category, id, name, price, slug, track]);

  return null;
}

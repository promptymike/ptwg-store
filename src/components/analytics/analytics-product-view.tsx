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
      product_id: id,
      slug,
      product_slug: slug,
      name,
      product_name: name,
      category,
      price,
      currency: "PLN",
    });
  }, [category, id, name, price, slug, track]);

  return null;
}

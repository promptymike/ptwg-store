"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { useAnalytics } from "@/components/analytics/analytics-provider";
import { Button } from "@/components/ui/button";
import {
  HERO_CTA_COPY,
  HERO_CTA_EXPERIMENT,
  type HeroCtaVariant,
  pickVariant,
} from "@/lib/experiments";

const HREF_BY_VARIANT: Record<HeroCtaVariant, string> = {
  browse: "/produkty",
  free_sample: "/produkty/budzet-domowy-dla-poczatkujacych",
  build_better_life: "/produkty",
};

type HeroCtaProps = {
  fallbackHref?: string;
};

export function HeroCta({ fallbackHref = "/produkty" }: HeroCtaProps) {
  const variant = pickVariant(HERO_CTA_EXPERIMENT);
  const { track } = useAnalytics();
  const reportedRef = useRef(false);

  useEffect(() => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    track("page_view", {
      experiment: HERO_CTA_EXPERIMENT.key,
      variant,
      surface: "hero_primary_cta_impression",
    });
  }, [track, variant]);

  function handleClick() {
    track("begin_checkout", {
      experiment: HERO_CTA_EXPERIMENT.key,
      variant,
      surface: "hero_primary_cta_click",
    });
  }

  const href = HREF_BY_VARIANT[variant] ?? fallbackHref;

  return (
    <Button
      size="lg"
      data-experiment={HERO_CTA_EXPERIMENT.key}
      data-variant={variant}
      render={<Link href={href} onClick={handleClick} />}
    >
      {HERO_CTA_COPY[variant]}
    </Button>
  );
}

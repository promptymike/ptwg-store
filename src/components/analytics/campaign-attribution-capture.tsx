"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  captureAttributionFromLocation,
  subscribeToAttributionConsent,
} from "@/lib/attribution";

export function CampaignAttributionCapture() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttributionFromLocation();
  }, [pathname]);

  useEffect(() => {
    return subscribeToAttributionConsent(() => {
      captureAttributionFromLocation();
    });
  }, []);

  return null;
}

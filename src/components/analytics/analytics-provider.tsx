"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
  CONSENT_UPDATED_EVENT,
  hasAnalyticsConsent,
  type ConsentState,
} from "@/lib/consent";

export type AnalyticsEventName =
  | "page_view"
  | "view_product"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase";

export type AnalyticsPayload = {
  name: AnalyticsEventName;
  properties: Record<string, unknown>;
  timestamp: string;
};

type AnalyticsContextValue = {
  analyticsEnabled: boolean;
  track: (name: AnalyticsEventName, properties?: Record<string, unknown>) => void;
};

type AnalyticsWindow = Window & {
  templifyAnalyticsQueue?: AnalyticsPayload[];
  dataLayer?: Array<Record<string, unknown>>;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

function pushAnalyticsEvent(payload: AnalyticsPayload) {
  const analyticsWindow = window as AnalyticsWindow;

  analyticsWindow.templifyAnalyticsQueue = analyticsWindow.templifyAnalyticsQueue ?? [];
  analyticsWindow.templifyAnalyticsQueue.push(payload);

  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.dataLayer.push({
    event: payload.name,
    ...payload.properties,
    timestamp: payload.timestamp,
  });

  analyticsWindow.dispatchEvent(
    new CustomEvent("templify-analytics-event", {
      detail: payload,
    }),
  );
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => hasAnalyticsConsent());

  useEffect(() => {
    const handleConsentUpdate = (event: Event) => {
      const nextConsent = (event as CustomEvent<ConsentState>).detail;
      setAnalyticsEnabled(Boolean(nextConsent.analytics));
    };

    window.addEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdate);

    return () => {
      window.removeEventListener(CONSENT_UPDATED_EVENT, handleConsentUpdate);
    };
  }, []);

  const track = useMemo(
    () => (name: AnalyticsEventName, properties: Record<string, unknown> = {}) => {
      if (!analyticsEnabled) {
        return;
      }

      pushAnalyticsEvent({
        name,
        properties,
        timestamp: new Date().toISOString(),
      });
    },
    [analyticsEnabled],
  );

  useEffect(() => {
    track("page_view", {
      path: pathname,
    });
  }, [pathname, track]);

  const value = useMemo(
    () => ({
      analyticsEnabled,
      track,
    }),
    [analyticsEnabled, track],
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }

  return context;
}

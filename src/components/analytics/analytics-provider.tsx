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

const VISITOR_ID_KEY = "templify:visitor-id";

function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

function shipEventToServer(payload: AnalyticsPayload) {
  const properties = payload.properties as Record<string, unknown>;
  const body = JSON.stringify({
    name: payload.name,
    visitorId: getVisitorId(),
    experimentKey:
      typeof properties.experiment === "string" ? properties.experiment : undefined,
    variant: typeof properties.variant === "string" ? properties.variant : undefined,
    surface:
      typeof properties.surface === "string" ? properties.surface : undefined,
    productId:
      typeof properties.productId === "string" ? properties.productId : undefined,
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
    amount:
      typeof properties.amount === "number" ? properties.amount : undefined,
    properties,
  });

  // navigator.sendBeacon survives navigations like add-to-cart → checkout.
  // Fallback to fetch keepalive for browsers / tabs that lack beacon.
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/event", blob);
      return;
    }
  } catch {
    // fall through to fetch
  }
  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

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

  shipEventToServer(payload);
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

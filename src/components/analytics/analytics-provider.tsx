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
import { captureAttributionFromLocation, readAttribution } from "@/lib/attribution";

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
      typeof properties.productId === "string"
        ? properties.productId
        : typeof properties.product_id === "string"
          ? properties.product_id
          : undefined,
    path: typeof window !== "undefined" ? window.location.pathname : undefined,
    amount: getNumericProperty(properties, [
      "amount",
      "order_total",
      "orderTotal",
      "price",
    ]),
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

function getNumericProperty(
  properties: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const value = properties[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^\d.,-]/g, "").replace(",", "."));

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function getStringProperty(
  properties: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const value = properties[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function normalizeAnalyticsItem(
  item: Record<string, unknown>,
  fallback: Record<string, unknown> = {},
) {
  const itemId = getStringProperty(item, ["product_id", "productId", "id"]) ??
    getStringProperty(fallback, ["product_id", "productId", "id"]);
  const itemName = getStringProperty(item, ["product_name", "productName", "name"]) ??
    getStringProperty(fallback, ["product_name", "productName", "name"]);
  const itemCategory = getStringProperty(item, ["category", "item_category"]) ??
    getStringProperty(fallback, ["category", "item_category"]);
  const itemSlug = getStringProperty(item, ["product_slug", "productSlug", "slug"]) ??
    getStringProperty(fallback, ["product_slug", "productSlug", "slug"]);
  const price = getNumericProperty(item, ["price", "unit_price", "unitPrice"]) ??
    getNumericProperty(fallback, ["price", "unit_price", "unitPrice"]);
  const quantity = getNumericProperty(item, ["quantity"]) ?? 1;

  return {
    item_id: itemId,
    item_name: itemName,
    item_category: itemCategory,
    item_variant: itemSlug,
    price,
    quantity,
  };
}

function buildEcommercePayload(
  payload: AnalyticsPayload,
): Record<string, unknown> | null {
  const properties = payload.properties;
  const currency = getStringProperty(properties, ["currency"]) ?? "PLN";
  const rawItems = Array.isArray(properties.items) ? properties.items : null;
  const fallbackItem = normalizeAnalyticsItem(properties);
  const items =
    rawItems && rawItems.length > 0
      ? rawItems
          .filter((item): item is Record<string, unknown> =>
            Boolean(item && typeof item === "object"),
          )
          .map((item) => normalizeAnalyticsItem(item, properties))
      : fallbackItem.item_id || fallbackItem.item_name
        ? [fallbackItem]
        : [];

  switch (payload.name) {
    case "view_product":
      return {
        currency,
        value: getNumericProperty(properties, ["price"]),
        items,
      };
    case "add_to_cart":
      return {
        currency,
        value: getNumericProperty(properties, ["price"]),
        items,
      };
    case "begin_checkout":
      return {
        currency,
        value: getNumericProperty(properties, [
          "order_total",
          "orderTotal",
          "subtotal",
        ]),
        items,
      };
    case "purchase":
      return {
        transaction_id: getStringProperty(properties, ["order_id", "orderId"]),
        currency,
        value: getNumericProperty(properties, [
          "order_total",
          "orderTotal",
          "amount",
        ]),
        items,
      };
    default:
      return null;
  }
}

function buildDataLayerPayload(payload: AnalyticsPayload) {
  const ecommerce = buildEcommercePayload(payload);

  return {
    event: payload.name,
    event_name: payload.name,
    ...payload.properties,
    timestamp: payload.timestamp,
    ...(ecommerce ? { ecommerce } : {}),
  };
}

function pushAnalyticsEvent(payload: AnalyticsPayload) {
  const analyticsWindow = window as AnalyticsWindow;

  analyticsWindow.templifyAnalyticsQueue = analyticsWindow.templifyAnalyticsQueue ?? [];
  analyticsWindow.templifyAnalyticsQueue.push(payload);

  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  analyticsWindow.dataLayer.push({ ecommerce: null });
  analyticsWindow.dataLayer.push(buildDataLayerPayload(payload));

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

      const attribution = readAttribution();
      const attributedProperties = attribution
        ? {
            ...attribution,
            ...properties,
          }
        : properties;

      pushAnalyticsEvent({
        name,
        properties: attributedProperties,
        timestamp: new Date().toISOString(),
      });
    },
    [analyticsEnabled],
  );

  useEffect(() => {
    captureAttributionFromLocation();
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

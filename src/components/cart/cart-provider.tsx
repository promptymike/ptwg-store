"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type CartProductSnapshot = {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  price: number;
  coverGradient: string;
};

type CartLine = {
  productId: string;
  quantity: number;
  product: CartProductSnapshot | null;
};

type CartContextValue = {
  items: CartLine[];
  totalItems: number;
  subtotal: number;
  isReady: boolean;
  addItem: (product: CartProductSnapshot, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "ptwg.cart";
const CART_EVENT_NAME = "ptwg-cart-updated";
const CartContext = createContext<CartContextValue | null>(null);
const EMPTY_CART_SNAPSHOT: CartLine[] = [];

let lastRawSnapshot: string | null = null;
let lastParsedSnapshot: CartLine[] = EMPTY_CART_SNAPSHOT;

function normalizeCartSnapshot(value: unknown): CartLine[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const productId =
        typeof entry.productId === "string" ? entry.productId : null;
      const quantity =
        typeof entry.quantity === "number" && Number.isFinite(entry.quantity)
          ? entry.quantity
          : null;
      const product =
        entry.product && typeof entry.product === "object"
          ? (entry.product as CartProductSnapshot)
          : null;

      if (!productId || !quantity || quantity < 1) {
        return null;
      }

      return {
        productId,
        quantity,
        product:
          product &&
          typeof product.id === "string" &&
          typeof product.slug === "string" &&
          typeof product.name === "string" &&
          typeof product.category === "string" &&
          typeof product.shortDescription === "string" &&
          typeof product.price === "number" &&
          typeof product.coverGradient === "string"
            ? product
            : null,
      };
    })
    .filter((entry): entry is CartLine => Boolean(entry));
}

function getCartSnapshot(): CartLine[] {
  if (typeof window === "undefined") {
    return EMPTY_CART_SNAPSHOT;
  }

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);

    if (stored === lastRawSnapshot) {
      return lastParsedSnapshot;
    }

    lastRawSnapshot = stored;
    lastParsedSnapshot = stored
      ? normalizeCartSnapshot(JSON.parse(stored))
      : EMPTY_CART_SNAPSHOT;

    return lastParsedSnapshot;
  } catch {
    lastParsedSnapshot = EMPTY_CART_SNAPSHOT;
    return lastParsedSnapshot;
  }
}

function subscribeToCartStore(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(CART_EVENT_NAME, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(CART_EVENT_NAME, handleChange);
  };
}

function writeCartSnapshot(items: CartLine[]) {
  const nextRawSnapshot = JSON.stringify(items);

  lastRawSnapshot = nextRawSnapshot;
  lastParsedSnapshot = items;
  window.localStorage.setItem(CART_STORAGE_KEY, nextRawSnapshot);
  window.dispatchEvent(new Event(CART_EVENT_NAME));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCartStore,
    getCartSnapshot,
    () => EMPTY_CART_SNAPSHOT,
  );
  const isReady = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.product?.price ?? 0) * item.quantity;
    }, 0);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal,
      totalItems,
      isReady,
      addItem(product, quantity = 1) {
        const current = getCartSnapshot();
        const existing = current.find((item) => item.productId === product.id);

        const nextItems = existing
          ? current.map((item) =>
              item.productId === product.id
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    product,
                  }
                : item,
            )
          : [...current, { productId: product.id, quantity, product }];

        writeCartSnapshot(nextItems);
      },
      removeItem(productId) {
        writeCartSnapshot(
          getCartSnapshot().filter((item) => item.productId !== productId),
        );
      },
      updateQuantity(productId, quantity) {
        const current = getCartSnapshot();

        if (quantity <= 0) {
          writeCartSnapshot(
            current.filter((item) => item.productId !== productId),
          );
          return;
        }

        writeCartSnapshot(
          current.map((item) =>
            item.productId === productId ? { ...item, quantity } : item,
          ),
        );
      },
      clearCart() {
        writeCartSnapshot([]);
      },
    };
  }, [isReady, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

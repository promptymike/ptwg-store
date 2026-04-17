"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getProductById } from "@/data/mock-store";

type CartLine = {
  productId: string;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  totalItems: number;
  subtotal: number;
  isReady: boolean;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "ptwg.cart";
const CART_EVENT_NAME = "ptwg-cart-updated";
const CartContext = createContext<CartContextValue | null>(null);

function getCartSnapshot(): CartLine[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartLine[]) : [];
  } catch {
    return [];
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
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT_NAME));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeToCartStore,
    getCartSnapshot,
    () => [],
  );
  const isReady = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => {
      const product = getProductById(item.productId);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal,
      totalItems,
      isReady,
      addItem(productId, quantity = 1) {
        const current = getCartSnapshot();
        const existing = current.find((item) => item.productId === productId);

        const nextItems = existing
          ? current.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [...current, { productId, quantity }];

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

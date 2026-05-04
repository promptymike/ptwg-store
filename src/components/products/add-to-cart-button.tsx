"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

import { useAnalytics } from "@/components/analytics/analytics-provider";
import {
  type CartProductSnapshot,
  useCart,
} from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  product: CartProductSnapshot;
  quantity?: number;
  fullWidth?: boolean;
};

export function AddToCartButton({
  product,
  quantity = 1,
  fullWidth = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { track } = useAnalytics();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, quantity);
    track("add_to_cart", {
      productId: product.id,
      product_id: product.id,
      slug: product.slug,
      product_slug: product.slug,
      name: product.name,
      product_name: product.name,
      category: product.category,
      price: product.price,
      currency: "PLN",
      quantity,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button
      onClick={handleAdd}
      className={fullWidth ? "w-full" : undefined}
      size="lg"
    >
      {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
      {added ? "Dodano do koszyka" : "Dodaj do koszyka"}
    </Button>
  );
}

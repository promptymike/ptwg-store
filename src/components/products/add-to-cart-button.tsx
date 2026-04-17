"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";

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
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, quantity);
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

// Window-event bridge for opening the mini-cart from anywhere in the tree
// (e.g. the add-to-cart button) without threading state through the layout.
// Mirrors the "ptwg-cart-updated" event the cart store already uses.

export const OPEN_MINI_CART_EVENT = "ptwg-open-mini-cart";

export function requestMiniCartOpen() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_MINI_CART_EVENT));
}

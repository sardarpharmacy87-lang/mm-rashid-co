"use client";
import { useSyncExternalStore } from "react";
import { cartKey, itemKey, type CartItem } from "./shop-rules";
function subscribe(callback: () => void) {
  window.addEventListener("mmr-bag", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("mmr-bag", callback);
    window.removeEventListener("storage", callback);
  };
}
function snapshot() {
  try {
    return localStorage.getItem(cartKey) || "[]";
  } catch {
    return "[]";
  }
}
export function readCart(raw: string): CartItem[] {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data)
      ? data
          .filter(
            (x) =>
              x &&
              typeof x.id === "string" &&
              typeof x.name === "string" &&
              typeof x.slug === "string" &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0 &&
              x.quantity <= 100000,
          )
          .slice(0, 30)
          .map((x) => ({
            id: x.id,
            name: x.name,
            slug: x.slug,
            quantity: x.quantity,
            size: typeof x.size === "string" ? x.size : "",
            color: typeof x.color === "string" ? x.color : "",
          }))
      : [];
  } catch {
    return [];
  }
}
export function useCart() {
  return readCart(useSyncExternalStore(subscribe, snapshot, () => "[]"));
}
export function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(cartKey, JSON.stringify(items));
    window.dispatchEvent(new Event("mmr-bag"));
    return true;
  } catch {
    return false;
  }
}
export function addCartItem(items: CartItem[], item: CartItem) {
  const existing = items.find((i) => itemKey(i) === itemKey(item));
  if (!existing && items.length >= 30)
    throw Error("Your cart holds up to 30 different selections.");
  return existing
    ? items.map((i) =>
        itemKey(i) === itemKey(item)
          ? { ...i, quantity: Math.min(100000, i.quantity + item.quantity) }
          : i,
      )
    : [...items, item];
}

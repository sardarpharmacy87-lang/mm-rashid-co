"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Currency = "PKR" | "USD";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  quantity: number;
  variantId?: string | null;
  variantLabel?: string | null;
  pricePkr?: number | null;
  priceUsd?: number | null;
};

type CommerceContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  cart: CartItem[];
  cartCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null | undefined, quantity: number) => void;
  clearCart: () => void;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

const CART_KEY = "mmr-cart-v1";
const CURRENCY_KEY = "mmr-currency-v1";

function sameItem(a: CartItem, b: Pick<CartItem, "productId" | "variantId">) {
  return a.productId === b.productId && (a.variantId ?? null) === (b.variantId ?? null);
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const savedCurrency = window.localStorage.getItem(CURRENCY_KEY);
      if (savedCurrency === "PKR" || savedCurrency === "USD") setCurrencyState(savedCurrency);

      const savedCart = window.localStorage.getItem(CART_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart) as CartItem[];
        if (Array.isArray(parsed)) setCart(parsed.filter((item) => item && item.productId));
      }
    } catch {
      // Keep clean defaults when browser storage is unavailable.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency, ready]);

  const setCurrency = (next: Currency) => setCurrencyState(next);

  const addToCart = (item: CartItem) => {
    setCart((current) => {
      const index = current.findIndex((existing) => sameItem(existing, item));
      if (index === -1) return [...current, { ...item, quantity: Math.max(1, item.quantity || 1) }];

      return current.map((existing, itemIndex) =>
        itemIndex === index
          ? { ...existing, quantity: existing.quantity + Math.max(1, item.quantity || 1) }
          : existing,
      );
    });
  };

  const removeFromCart = (productId: string, variantId?: string | null) => {
    setCart((current) =>
      current.filter(
        (item) => !(item.productId === productId && (item.variantId ?? null) === (variantId ?? null)),
      ),
    );
  };

  const updateQuantity = (
    productId: string,
    variantId: string | null | undefined,
    quantity: number,
  ) => {
    const nextQuantity = Math.max(1, Math.min(999, Math.floor(quantity || 1)));
    setCart((current) =>
      current.map((item) =>
        item.productId === productId && (item.variantId ?? null) === (variantId ?? null)
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    );
  };

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      cart,
      cartCount: cart.reduce((total, item) => total + item.quantity, 0),
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart: () => setCart([]),
    }),
    [cart, currency],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
}

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) throw new Error("useCommerce must be used inside CommerceProvider");
  return context;
}

export function formatStorePrice(amount: number | null | undefined, currency: Currency) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return null;
  return new Intl.NumberFormat(currency === "PKR" ? "en-PK" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "PKR" ? 0 : 2,
  }).format(Number(amount));
}

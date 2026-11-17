export const shopCurrencies = ["USD", "GBP", "EUR", "PKR", "AED"] as const;
export type ShopSettings = {
  currency: string;
  checkout_enabled: boolean;
  shipping_fee: number;
  free_shipping_threshold: number | null;
  tax_percent: number;
  minimum_order: number;
  max_quantity: number;
  checkout_note: string;
};
export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  stock_status: string;
  primary_image?: string | null;
  sizes: string[];
  colors: string[];
  public_price: number | null;
  price_on_request: boolean;
};
export type CartItem = {
  id: string;
  name: string;
  slug: string;
  quantity: number;
  size: string;
  color: string;
};
export const cartKey = "mmr-quotation-bag";
export function itemKey(item: Pick<CartItem, "id" | "size" | "color">) {
  return JSON.stringify([item.id, item.size || "", item.color || ""]);
}
export function visiblePrice(
  product: Pick<ShopProduct, "public_price" | "price_on_request">,
) {
  const amount = Number(product.public_price);
  return product.price_on_request === false &&
    Number.isFinite(amount) &&
    amount > 0
    ? amount
    : null;
}
export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency }).format(
    amount,
  );
}
export function cartTotals(subtotal: number, settings: ShopSettings) {
  const shipping =
    settings.free_shipping_threshold !== null &&
    subtotal >= Number(settings.free_shipping_threshold)
      ? 0
      : Number(settings.shipping_fee);
  const tax = Math.round(subtotal * Number(settings.tax_percent)) / 100;
  return {
    subtotal,
    shipping,
    tax,
    total: Math.round((subtotal + shipping + tax) * 100) / 100,
  };
}
export function parseOptions(value: string) {
  const options = Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  );
  if (options.length > 40 || options.some((v) => v.length > 80))
    throw new Error("Use up to 40 options, each 80 characters or fewer.");
  return options;
}
export function safeReturnPath(value: unknown) {
  const path = typeof value === "string" ? value : "";
  return /^\/(quotation|cart)(\?|$)/.test(path) && !/[\\\r\n]/.test(path)
    ? path
    : "";
}

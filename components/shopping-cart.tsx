"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, saveCart } from "@/lib/cart-store";
import {
  formatMoney,
  cartTotals,
  visiblePrice,
  itemKey,
  type ShopSettings,
  type ShopProduct,
  type CartItem,
} from "@/lib/shop-rules";
import { placeOrder } from "@/app/cart/actions";
import { countries } from "@/lib/regions";
type Profile = {
  full_name?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  postal_code?: string;
};
export function ShoppingCart({
  products,
  settings,
  profile,
  signedIn,
  methods,
}: {
  products: ShopProduct[];
  settings: ShopSettings;
  profile: Profile | null;
  signedIn: boolean;
  methods: { id: number; name: string; kind: string }[];
}) {
  const items = useCart();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const token = useRef("");
  const rows = items.map((item) => ({
    item,
    product: products.find((p) => p.id === item.id),
  }));
  const needsQuote = rows.some(
    ({ product }) => !product || visiblePrice(product) === null,
  );
  const invalid = rows.some(
    ({ item, product: p }) =>
      !p ||
      p.stock_status === "out_of_stock" ||
      item.quantity > settings.max_quantity ||
      (p.sizes.length > 0 && !p.sizes.includes(item.size)) ||
      (!p.sizes.length && item.size !== "") ||
      (p.colors.length > 0 && !p.colors.includes(item.color)) ||
      (!p.colors.length && item.color !== ""),
  );
  const subtotal = rows.reduce(
    (sum, { item, product }) =>
      sum + (product ? visiblePrice(product) || 0 : 0) * item.quantity,
    0,
  );
  const totals = cartTotals(subtotal, settings);
  const money = (n: number) => formatMoney(n, settings.currency);
  function update(index: number, patch: Partial<CartItem>) {
    token.current = "";
    const next = items.map((i, j) => (j === index ? { ...i, ...patch } : i));
    const keys = next.map(itemKey);
    if (new Set(keys).size !== keys.length) {
      setMessage(
        "This selection is already in your cart. Update its quantity instead.",
      );
      return;
    }
    if (!saveCart(next)) setMessage("Browser storage is unavailable.");
    else setMessage("");
  }
  if (!items.length)
    return (
      <section>
        <h2>Your cart is empty.</h2>
        <p>Select a product, size, color and quantity to begin.</p>
        <Link className="atelier-button" href="/products">
          Browse products
        </Link>
        <p>
          <Link className="text-link" href="/quotation">
            Have your own design? Request a quotation →
          </Link>
        </p>
      </section>
    );
  return (
    <div className="bag-layout shopping-cart">
      <section aria-label="Cart items">
        {rows.map(({ item, product: p }, index) => (
          <article className="cart-line" key={itemKey(item)}>
            <div className="cart-line-heading">
              <Link
                href={"/products/" + encodeURIComponent(p?.slug || item.slug)}
              >
                {p?.name || item.name}
              </Link>
              <button
                disabled={pending}
                type="button"
                onClick={() => {
                  token.current = "";
                  saveCart(items.filter((_, i) => i !== index));
                }}
              >
                Remove
              </button>
            </div>
            {!p ? (
              <p role="alert">
                This product is no longer available. Remove it to continue.
              </p>
            ) : (
              <>
                <div className="form-grid">
                  {p.sizes.length > 0 && (
                    <label>
                      Size
                      <select
                        aria-label={"Size for " + p.name}
                        disabled={pending}
                        value={item.size}
                        onChange={(e) =>
                          update(index, { size: e.target.value })
                        }
                      >
                        <option value="">Choose size</option>
                        {p.sizes.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  {p.colors.length > 0 && (
                    <label>
                      Color
                      <select
                        aria-label={"Color for " + p.name}
                        disabled={pending}
                        value={item.color}
                        onChange={(e) =>
                          update(index, { color: e.target.value })
                        }
                      >
                        <option value="">Choose color</option>
                        {p.colors.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label>
                    Quantity
                    <input
                      aria-label={"Quantity for " + p.name}
                      disabled={pending}
                      type="number"
                      min="1"
                      max={settings.max_quantity}
                      step="1"
                      value={item.quantity}
                      onChange={(e) =>
                        update(index, {
                          quantity: Math.max(
                            1,
                            Math.min(
                              settings.max_quantity,
                              Math.floor(Number(e.target.value) || 1),
                            ),
                          ),
                        })
                      }
                    />
                  </label>
                </div>
                <p>
                  {visiblePrice(p) === null
                    ? "Price by quotation"
                    : `${money(visiblePrice(p)!)} each · ${money(visiblePrice(p)! * item.quantity)}`}
                </p>
                {p.stock_status === "out_of_stock" && (
                  <p role="alert">Currently unavailable for purchase.</p>
                )}
              </>
            )}
          </article>
        ))}
        <Link className="text-link" href="/products">
          Continue shopping →
        </Link>
      </section>
      <section className="bag-form">
        <h2>{needsQuote ? "Your quotation" : "Order summary"}</h2>
        {needsQuote ? (
          <p>
            Your selection includes a product without a public price. Send the
            full selection for a custom quotation.
          </p>
        ) : (
          <dl className="cart-totals">
            <div>
              <dt>Products</dt>
              <dd>{money(totals.subtotal)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{money(totals.shipping)}</dd>
            </div>
            <div>
              <dt>Tax ({settings.tax_percent}%)</dt>
              <dd>{money(totals.tax)}</dd>
            </div>
            <div>
              <dt>Total ({settings.currency})</dt>
              <dd>{money(totals.total)}</dd>
            </div>
          </dl>
        )}
        {settings.checkout_note && <p>{settings.checkout_note}</p>}
        {invalid && (
          <p role="alert">
            Review unavailable products, sizes, colors and quantities before
            checkout.
          </p>
        )}
        {!needsQuote && subtotal < Number(settings.minimum_order) && (
          <p>
            Minimum product subtotal: {money(Number(settings.minimum_order))}.
          </p>
        )}
        {!needsQuote &&
          settings.checkout_enabled &&
          !invalid &&
          subtotal >= Number(settings.minimum_order) &&
          (signedIn ? (
            <form
              className="portal-form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (pending) return;
                setPending(true);
                setMessage("");
                const form = new FormData(e.currentTarget);
                token.current ||= crypto.randomUUID();
                form.set("token", token.current);
                form.set(
                  "items",
                  JSON.stringify(
                    items.map(({ id, quantity, size, color }) => ({
                      id,
                      quantity,
                      size,
                      color,
                    })),
                  ),
                );
                form.set("currency", settings.currency);
                form.set("expected_total", String(totals.total));
                try {
                  const result = await placeOrder(form);
                  if (result.error) {
                    setMessage(result.error);
                    return;
                  }
                  saveCart([]);
                  router.push(result.url);
                } catch {
                  setMessage(
                    "Connection interrupted. Retry to check or finish this order; you will not create a duplicate.",
                  );
                } finally {
                  setPending(false);
                }
              }}
            >
              <fieldset disabled={pending}>
                <legend>Delivery details</legend>
                <label>
                  Full name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={200}
                    defaultValue={profile?.full_name}
                  />
                </label>
                <label>
                  Phone
                  <input
                    name="phone"
                    autoComplete="tel"
                    required
                    minLength={5}
                    maxLength={100}
                    defaultValue={profile?.phone}
                  />
                </label>
                <label>
                  Country
                  <select
                    name="country"
                    autoComplete="country-name"
                    defaultValue={profile?.country || "Pakistan"}
                  >
                    {countries.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  City
                  <input
                    name="city"
                    autoComplete="address-level2"
                    required
                    maxLength={100}
                    defaultValue={profile?.city}
                  />
                </label>
                <label>
                  Street address
                  <textarea
                    name="address"
                    autoComplete="street-address"
                    required
                    minLength={5}
                    maxLength={500}
                    defaultValue={profile?.address}
                  />
                </label>
                <label>
                  Postal code
                  <input
                    name="postal_code"
                    autoComplete="postal-code"
                    required
                    maxLength={30}
                    defaultValue={profile?.postal_code}
                  />
                </label>
                <label>
                  Order notes (optional)
                  <textarea name="notes" maxLength={2000} />
                </label>
                <label>
                  Payment method
                  <select name="method" required defaultValue="">
                    <option value="" disabled>
                      Choose payment method
                    </option>
                    {methods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                        {m.kind === "hosted_gateway"
                          ? " — secure link after order"
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
                {!methods.length && (
                  <p>
                    Payment methods are being configured. Please request a
                    quotation instead.
                  </p>
                )}
                <label className="checkbox-label">
                  <input name="terms" type="checkbox" required />I agree to the{" "}
                  <Link href="/terms">order terms</Link>.
                </label>
                <button
                  className="portal-button"
                  disabled={!methods.length || pending}
                >
                  {pending
                    ? "Placing order…"
                    : "Place order · " + money(totals.total)}
                </button>
              </fieldset>
              <p>
                You will receive payment instructions after placing the order.
                The order remains unpaid until receipt is verified.
              </p>
            </form>
          ) : (
            <Link className="atelier-button" href="/sign-in?next=%2Fcart">
              Sign in to checkout
            </Link>
          ))}
        {!settings.checkout_enabled && !needsQuote && (
          <p>
            Online checkout is not yet enabled. Request a quotation to order.
          </p>
        )}
        {message && (
          <p className="form-alert form-alert-error" role="alert">
            {message}
          </p>
        )}
        <Link
          className={needsQuote ? "atelier-button" : "text-link"}
          href="/quotation?from=cart"
        >
          {needsQuote
            ? "Request quotation for this cart"
            : "Request a custom quotation instead"}{" "}
          →
        </Link>
      </section>
    </div>
  );
}

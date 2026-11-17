import Link from "next/link";
import { getShopSettings } from "@/lib/shop";
import { shopCurrencies } from "@/lib/shop-rules";
import { saveCheckout } from "./actions";
export default async function CheckoutSettings({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const s = await getShopSettings();
  const { saved } = await searchParams;
  const messages: Record<string, string> = {
    "1": "Cart settings saved.",
    invalid: "Check the amounts and quantity limit.",
    payment: "Enable a payment method before turning on checkout.",
    currency:
      "Hide existing public product prices before changing currency, then enter new prices in that currency.",
    error: "Settings could not be saved. Please retry.",
  };
  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Online ordering</p>
          <h1>Cart &amp; checkout settings</h1>
          <p>
            Products with a public price can be purchased. Hidden-price products
            use your quotation process.
          </p>
        </div>
        <Link className="portal-button" href="/admin/payments">
          Payment methods
        </Link>
      </div>
      {saved && (
        <p
          role="status"
          className={
            "form-alert " +
            (saved === "1" ? "form-alert-success" : "form-alert-error")
          }
        >
          {messages[saved] || messages.error}
        </p>
      )}
      <section className="portal-section">
        <form action={saveCheckout} className="portal-form">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="checkout_enabled"
              defaultChecked={s.checkout_enabled}
            />
            Enable checkout for priced products
          </label>
          <div className="form-grid">
            <label>
              Store currency
              <select name="currency" defaultValue={s.currency}>
                {shopCurrencies.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Flat shipping fee
              <input
                name="shipping_fee"
                type="number"
                min="0"
                max="1000000"
                step="0.01"
                required
                defaultValue={s.shipping_fee}
              />
            </label>
            <label>
              Free shipping from (leave blank to disable)
              <input
                name="free_shipping_threshold"
                type="number"
                min="0.01"
                max="100000000"
                step="0.01"
                defaultValue={s.free_shipping_threshold ?? ""}
              />
            </label>
            <label>
              Tax on product subtotal (%)
              <input
                name="tax_percent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                defaultValue={s.tax_percent}
              />
            </label>
            <label>
              Minimum product subtotal
              <input
                name="minimum_order"
                type="number"
                min="0"
                max="100000000"
                step="0.01"
                required
                defaultValue={s.minimum_order}
              />
            </label>
            <label>
              Maximum quantity per selection
              <input
                name="max_quantity"
                type="number"
                min="1"
                max="100000"
                step="1"
                required
                defaultValue={s.max_quantity}
              />
            </label>
            <label className="form-span-two">
              Checkout note
              <textarea
                name="checkout_note"
                rows={3}
                maxLength={2000}
                defaultValue={s.checkout_note}
                placeholder="Production time, delivery arrangements or ordering guidance"
              />
            </label>
          </div>
          <p>
            All prices and charges use the store currency. Shipping and tax
            settings apply to every destination; use quotations for orders
            requiring individual shipping or tax calculations.
          </p>
          <button className="portal-button">Save cart settings</button>
        </form>
      </section>
    </main>
  );
}

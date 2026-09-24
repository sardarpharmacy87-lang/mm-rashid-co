"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { submitCartEnquiry } from "@/app/cart/actions";
import { formatStorePrice, useCommerce } from "@/components/commerce-provider";

export function CartClient() {
  const searchParams = useSearchParams();
  const { cart, currency, removeFromCart, updateQuantity, clearCart } = useCommerce();
  const error = searchParams.get("error");

  const pricedTotal = cart.reduce((sum, item) => {
    const value = currency === "PKR" ? item.pricePkr : item.priceUsd;
    return sum + (value ? Number(value) * item.quantity : 0);
  }, 0);
  const allPriced = cart.length > 0 && cart.every((item) => {
    const value = currency === "PKR" ? item.pricePkr : item.priceUsd;
    return value !== null && value !== undefined;
  });

  if (!cart.length) {
    return (
      <div className="cart-empty">
        <h1>Your quotation basket is empty</h1>
        <p>Add products from the catalogue, then submit them together for pricing or an order enquiry.</p>
        <Link className="store-primary-button" href="/products">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <section className="cart-items">
        <div className="cart-title-row">
          <div>
            <p className="store-kicker">Quotation basket</p>
            <h1>Your selected products</h1>
          </div>
          <button type="button" onClick={clearCart}>Clear basket</button>
        </div>

        {cart.map((item) => {
          const unit = currency === "PKR" ? item.pricePkr : item.priceUsd;
          return (
            <article className="cart-line" key={item.productId + ":" + (item.variantId ?? "base")}>
              <Link className="cart-line-image" href={"/products/" + item.slug}>
                {item.image ? <img src={item.image} alt="" /> : null}
              </Link>
              <div className="cart-line-copy">
                <Link href={"/products/" + item.slug}><h2>{item.name}</h2></Link>
                {item.variantLabel ? <p>Option: {item.variantLabel}</p> : null}
                <strong>{formatStorePrice(unit, currency) ?? "Price on request"}</strong>
              </div>
              <label className="cart-quantity">
                <span>Qty</span>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={item.quantity}
                  onChange={(event) =>
                    updateQuantity(item.productId, item.variantId, Number(event.target.value))
                  }
                />
              </label>
              <button
                className="cart-remove"
                type="button"
                onClick={() => removeFromCart(item.productId, item.variantId)}
              >
                Remove
              </button>
            </article>
          );
        })}
      </section>

      <aside className="cart-summary">
        <h2>Request quotation</h2>
        <p>
          Submit the full basket to MM Rashid &amp; Co. We will review quantity,
          artwork and delivery requirements before issuing the final quotation.
        </p>

        {allPriced ? (
          <div className="cart-estimate">
            <span>Current catalogue estimate</span>
            <strong>{formatStorePrice(pricedTotal, currency)}</strong>
            <small>Final quotation may change with customization and shipping.</small>
          </div>
        ) : (
          <div className="cart-estimate">
            <span>Pricing</span>
            <strong>Custom quotation</strong>
            <small>One or more selected items are priced after specification review.</small>
          </div>
        )}

        {error ? <p className="cart-error">{error}</p> : null}

        <form action={submitCartEnquiry} className="cart-enquiry-form">
          <input type="hidden" name="cartJson" value={JSON.stringify(cart)} />
          <label>
            Delivery country
            <input name="deliveryCountry" required placeholder="e.g. United States" />
          </label>
          <label>
            Required by
            <input name="requiredBy" type="date" />
          </label>
          <label>
            Notes / customization
            <textarea name="customerNote" rows={4} placeholder="Colours, artwork, dimensions, event date..." />
          </label>
          <button type="submit">Submit quotation request</button>
        </form>

        <p className="cart-login-note">You will be asked to sign in if you are not already logged in.</p>
      </aside>
    </div>
  );
}

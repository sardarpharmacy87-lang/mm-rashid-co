"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { submitCartEnquiry } from "@/app/cart/actions";
import { useCommerce } from "@/components/commerce-provider";

export function CartClient() {
  const searchParams = useSearchParams();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCommerce();
  const error = searchParams.get("error");

  if (!cart.length) {
    return (
      <div className="cart-empty">
        <h1>No pieces selected</h1>
        <p>Add any products you want us to quote, then send the list with your details.</p>
        <Link className="store-primary-button" href="/products">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <section className="cart-items">
        <div className="cart-title-row">
          <div>
            <p className="store-kicker">Selected pieces</p>
            <h1>Enquiry list</h1>
          </div>
          <button type="button" onClick={clearCart}>Clear list</button>
        </div>

        {cart.map((item) => (
          <article className="cart-line" key={item.productId + ":" + (item.variantId ?? "base")}>
            <Link className="cart-line-image" href={"/products/" + item.slug}>
              {item.image ? <img src={item.image} alt="" /> : null}
            </Link>
            <div className="cart-line-copy">
              <Link href={"/products/" + item.slug}><h2>{item.name}</h2></Link>
              {item.variantLabel ? <p>Option: {item.variantLabel}</p> : null}
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
        ))}
      </section>

      <aside className="cart-summary">
        <h2>Send enquiry</h2>
        <p>
          We will review the quantities, artwork and delivery details before
          preparing a quotation.
        </p>

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
            Notes
            <textarea name="customerNote" rows={4} placeholder="Colours, artwork, dimensions, event date..." />
          </label>
          <button type="submit">Send enquiry</button>
        </form>

        <p className="cart-login-note">Sign in is required before the enquiry is submitted.</p>
      </aside>
    </div>
  );
}

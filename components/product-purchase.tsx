"use client";
import Link from "next/link";
import { useState } from "react";
import { addCartItem, saveCart, useCart } from "@/lib/cart-store";
import { visiblePrice, formatMoney, type ShopProduct } from "@/lib/shop-rules";
export function ProductPurchase({
  product,
  currency,
  maxQuantity,
}: {
  product: ShopProduct;
  currency: string;
  maxQuantity: number;
}) {
  const items = useCart();
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  const price = visiblePrice(product);
  return (
    <div className="product-rate-request storefront-order-panel">
      <h2>
        {price === null ? "Made to your requirements" : "Choose your options"}
      </h2>
      {price !== null ? (
        <p className="public-product-price">
          {formatMoney(price, currency)}{" "}
          <small>per piece · shipping and tax shown in cart</small>
        </p>
      ) : (
        <p>
          Request a private quotation for your quantity, size, color and finish.
        </p>
      )}
      {product.stock_status === "out_of_stock" ? (
        <p>
          This product is currently unavailable.{" "}
          <Link href={"/quotation?product=" + product.id}>
            Ask about a custom alternative
          </Link>
          .
        </p>
      ) : (
        <form
          className="product-rate-form"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            try {
              const next = addCartItem(items, {
                id: product.id,
                name: product.name,
                slug: product.slug,
                size: String(data.get("size") || ""),
                color: String(data.get("color") || ""),
                quantity: Number(data.get("quantity")),
              });
              if (!saveCart(next))
                throw Error("Please enable browser storage to save your cart.");
              setMessage("Added to your cart.");
              setAdded(true);
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Unable to add this item.",
              );
            }
          }}
        >
          {!!product.sizes.length && (
            <label>
              Size
              <select name="size" required defaultValue="">
                <option value="" disabled>
                  Select size
                </option>
                {product.sizes.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          )}
          {!!product.colors.length && (
            <label>
              Color
              <select name="color" required defaultValue="">
                <option value="" disabled>
                  Select color
                </option>
                {product.colors.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            Quantity
            <input
              name="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              step="1"
              defaultValue="1"
              required
            />
          </label>
          <button className="store-primary-button" type="submit">
            Add to cart
          </button>
        </form>
      )}
      {message && (
        <p role="status">
          {message}{" "}
          {added && (
            <Link className="text-link" href="/cart">
              View cart →
            </Link>
          )}
        </p>
      )}
      <p>
        <Link className="text-link" href={"/quotation?product=" + product.id}>
          Request custom size, color or quotation →
        </Link>
      </p>
    </div>
  );
}

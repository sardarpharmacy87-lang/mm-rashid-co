"use client";
import { useState } from "react";
export function AdminProductOptions({
  product,
  currency,
}: {
  product?: {
    sizes?: string[];
    colors?: string[];
    price_on_request?: boolean;
    public_price?: number | null;
  };
  currency: string;
}) {
  const [showPrice, setShowPrice] = useState(
    product?.price_on_request === false,
  );
  return (
    <fieldset className="commerce-options form-span-two">
      <legend>Sizes, colors &amp; pricing</legend>
      <div className="form-grid">
        <label>
          Available sizes
          <textarea
            name="sizes"
            rows={3}
            defaultValue={product?.sizes?.join("\n") || ""}
            placeholder={"S\nM\nL\nXL"}
          />
          <small>
            One per line or separated by commas. Leave blank for one size.
          </small>
        </label>
        <label>
          Available colors
          <textarea
            name="colors"
            rows={3}
            defaultValue={product?.colors?.join("\n") || ""}
            placeholder={"Navy\nWhite\nBlack"}
          />
          <small>
            Customers choose these before adding a product to their cart.
          </small>
        </label>
        <label className="checkbox-label form-span-two">
          <input
            name="showPrice"
            type="checkbox"
            checked={showPrice}
            onChange={(e) => setShowPrice(e.target.checked)}
          />
          Show price and allow purchase
        </label>
        {showPrice && (
          <label>
            Unit price ({currency})
            <input
              name="publicPrice"
              type="number"
              min="0.01"
              max="1000000"
              step="0.01"
              required
              defaultValue={product?.public_price ?? ""}
            />
          </label>
        )}
        <p className="form-span-two">
          When price is hidden, customers request a quotation. Hiding the price
          clears the public amount. Set your store currency and checkout rules
          in Cart &amp; checkout settings.
        </p>
      </div>
    </fieldset>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatStorePrice, useCommerce } from "@/components/commerce-provider";

type Variant = {
  id: string;
  label: string;
  price_pkr: number | null;
  price_usd: number | null;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  primary_image: string | null;
  price_pkr: number | null;
  price_usd: number | null;
  price_on_request: boolean;
  stock_status: string;
};

export function ProductDetailBuybox({
  product,
  variants,
}: {
  product: Product;
  variants: Variant[];
}) {
  const { currency, addToCart } = useCommerce();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const selected = useMemo(
    () => variants.find((variant) => variant.id === variantId) ?? null,
    [variantId, variants],
  );

  const pkr = selected?.price_pkr ?? product.price_pkr;
  const usd = selected?.price_usd ?? product.price_usd;
  const price = currency === "PKR" ? pkr : usd;
  const label = formatStorePrice(price, currency);

  return (
    <div className="product-buybox">
      {variants.length ? (
        <label className="product-option">
          <span>Choose option / size</span>
          <select value={variantId} onChange={(event) => setVariantId(event.target.value)}>
            {variants.map((variant) => (
              <option value={variant.id} key={variant.id}>{variant.label}</option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="detail-price">
        {product.price_on_request || !label ? (
          <>
            <strong>Price on request</strong>
            <small>Final price depends on artwork, material, size and quantity.</small>
          </>
        ) : (
          <strong>{label}</strong>
        )}
      </div>

      <div className="quantity-row">
        <label>
          Quantity
          <input
            type="number"
            min={1}
            max={999}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
          />
        </label>
        <button
          type="button"
          className="detail-add-button"
          disabled={product.stock_status === "out_of_stock"}
          onClick={() =>
            addToCart({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.primary_image,
              quantity,
              variantId: selected?.id ?? null,
              variantLabel: selected?.label ?? null,
              pricePkr: pkr,
              priceUsd: usd,
            })
          }
        >
          {product.price_on_request ? "Add to quotation basket" : "Add to cart"}
        </button>
      </div>

      <Link className="buybox-cart-link" href="/cart">Open quotation basket →</Link>

      <div className="buybox-notes">
        <span>✓ Custom artwork accepted</span>
        <span>✓ Worldwide enquiries</span>
        <span>✓ Handcrafted in Sialkot</span>
      </div>
    </div>
  );
}

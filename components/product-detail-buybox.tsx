"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCommerce } from "@/components/commerce-provider";

type Variant = {
  id: string;
  label: string;
};

type Product = {
  id: string;
  slug: string;
  name: string;
  primary_image: string | null;
  stock_status: string;
};

export function ProductDetailBuybox({
  product,
  variants,
}: {
  product: Product;
  variants: Variant[];
}) {
  const { addToCart } = useCommerce();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const selected = useMemo(
    () => variants.find((variant) => variant.id === variantId) ?? null,
    [variantId, variants],
  );

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
            })
          }
        >
          Add to quotation basket
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

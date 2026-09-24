"use client";

import Link from "next/link";
import { useCommerce } from "@/components/commerce-provider";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  short_description?: string | null;
  primary_image?: string | null;
  stock_status: string;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { addToCart } = useCommerce();

  const stockLabel =
    product.stock_status === "in_stock"
      ? "In stock"
      : product.stock_status === "out_of_stock"
        ? "Out of stock"
        : "Made to order";

  return (
    <article className="store-product-card">
      <Link className="store-product-media" href={"/products/" + product.slug}>
        {product.primary_image ? (
          <img src={product.primary_image} alt={product.name} loading="lazy" />
        ) : (
          <div className="store-image-placeholder">MM RASHID & CO.</div>
        )}
        <span className={"stock-pill stock-" + product.stock_status}>{stockLabel}</span>
      </Link>

      <div className="store-product-content">
        <Link href={"/products/" + product.slug}>
          <h3>{product.name}</h3>
        </Link>
        {product.short_description ? <p className="product-short">{product.short_description}</p> : null}

        <div className="product-card-actions">
          <Link href={"/products/" + product.slug}>View details</Link>
          <button
            type="button"
            disabled={product.stock_status === "out_of_stock"}
            onClick={() =>
              addToCart({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.primary_image ?? null,
                quantity: 1,
              })
            }
          >
            Add to quotation
          </button>
        </div>
      </div>
    </article>
  );
}

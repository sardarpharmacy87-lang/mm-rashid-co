"use client";

import Link from "next/link";
import { formatStorePrice, useCommerce } from "@/components/commerce-provider";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  short_description?: string | null;
  primary_image?: string | null;
  price_pkr?: number | null;
  price_usd?: number | null;
  previous_price_pkr?: number | null;
  previous_price_usd?: number | null;
  price_on_request: boolean;
  stock_status: string;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { currency, addToCart } = useCommerce();
  const current = currency === "PKR" ? product.price_pkr : product.price_usd;
  const previous = currency === "PKR" ? product.previous_price_pkr : product.previous_price_usd;
  const currentLabel = formatStorePrice(current, currency);
  const previousLabel = formatStorePrice(previous, currency);
  const hasDiscount =
    current !== null &&
    current !== undefined &&
    previous !== null &&
    previous !== undefined &&
    Number(previous) > Number(current);

  const discount = hasDiscount
    ? Math.round((1 - Number(current) / Number(previous)) * 100)
    : 0;

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
        {discount > 0 ? <span className="discount-pill">-{discount}%</span> : null}
      </Link>

      <div className="store-product-content">
        <Link href={"/products/" + product.slug}>
          <h3>{product.name}</h3>
        </Link>
        {product.short_description ? <p className="product-short">{product.short_description}</p> : null}

        <div className="product-price-row">
          {product.price_on_request || !currentLabel ? (
            <strong>Price on request</strong>
          ) : (
            <>
              <strong>{currentLabel}</strong>
              {hasDiscount && previousLabel ? <del>{previousLabel}</del> : null}
            </>
          )}
        </div>

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
                pricePkr: product.price_pkr ?? null,
                priceUsd: product.price_usd ?? null,
              })
            }
          >
            {product.price_on_request ? "Add to quote" : "Add to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

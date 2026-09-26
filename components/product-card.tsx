import Image from "next/image";
import Link from "next/link";
import { AddToBag } from "@/components/quote-bag";

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
          <Image
            src={product.primary_image}
            alt={product.name}
            fill
            sizes="(max-width: 620px) 50vw, (max-width: 1050px) 33vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="store-image-placeholder">MM RASHID & CO.</div>
        )}
        <span className={"stock-pill stock-" + product.stock_status}>
          {stockLabel}
        </span>
      </Link>

      <div className="store-product-content">
        <Link href={"/products/" + product.slug}>
          <h3>{product.name}</h3>
        </Link>
        {product.short_description ? (
          <p className="product-short">{product.short_description}</p>
        ) : null}

        <div className="product-card-actions">
          <Link href={"/products/" + product.slug}>Discover piece ↗</Link>
          {product.stock_status !== "out_of_stock" && (
            <AddToBag
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
}

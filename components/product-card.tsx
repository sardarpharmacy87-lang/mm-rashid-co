import Image from "next/image";
import Link from "next/link";
import { getShopSettings } from "@/lib/shop";
import { formatMoney, visiblePrice } from "@/lib/shop-rules";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  short_description?: string | null;
  primary_image?: string | null;
  stock_status: string;
  public_price?: number | null;
  price_on_request?: boolean;
};

export async function ProductCard({ product }: { product: ProductCardData }) {
  const shop = await getShopSettings();
  const price = visiblePrice({
    public_price: product.public_price ?? null,
    price_on_request: product.price_on_request !== false,
  });
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

        {price !== null && (
          <p className="public-product-price">
            {formatMoney(price, shop.currency)}
          </p>
        )}
        <div className="product-card-actions">
          <Link href={"/products/" + product.slug}>View product ↗</Link>
          {product.stock_status !== "out_of_stock" && (
            <Link
              className="product-options-link"
              href={
                price === null
                  ? "/quotation?product=" + product.id
                  : "/products/" + product.slug
              }
            >
              {price === null ? "Request quotation" : "Choose options"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

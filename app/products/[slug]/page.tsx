import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";
import { ProductPurchase } from "@/components/product-purchase";
import { getShopSettings } from "@/lib/shop";
import { ProductShare } from "@/components/product-share";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ enquiry?: string }>;
};

async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description:
      product.short_description ??
      product.description ??
      "Ceremonial regalia by MM Rashid & Co.",
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  await searchParams;
  const shop = await getShopSettings();
  const supabase = await createClient();
  const product = await getProduct(slug);
  if (!product) notFound();

  const [relatedResult, groupResult] = await Promise.all([
    product.product_group_id
      ? supabase
          .from("products")
          .select(
            "id, name, slug, sku, short_description, primary_image, stock_status, public_price, price_on_request",
          )
          .eq("active", true)
          .eq("product_group_id", product.product_group_id)
          .neq("id", product.id)
          .order("sort_order", { ascending: true })
          .limit(4)
      : supabase
          .from("products")
          .select(
            "id, name, slug, sku, short_description, primary_image, stock_status, public_price, price_on_request",
          )
          .eq("active", true)
          .neq("id", product.id)
          .order("sort_order", { ascending: true })
          .limit(4),
    product.product_group_id
      ? supabase
          .from("product_groups")
          .select("id, name, slug")
          .eq("id", product.product_group_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const related = (relatedResult.data ?? []) as ProductCardData[];
  const group = groupResult.data as {
    id: string;
    name: string;
    slug: string;
  } | null;
  const images = Array.from(
    new Set([product.primary_image, ...(product.images ?? [])].filter(Boolean)),
  ) as string[];
  const specifications =
    product.specifications && typeof product.specifications === "object"
      ? Object.entries(product.specifications as Record<string, unknown>)
      : [];
  const staticSpecifications = specifications;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku ?? undefined,
    description: product.description ?? product.short_description ?? undefined,
    image: images,
    brand: { "@type": "Brand", name: "MM Rashid & Co." },
  };

  return (
    <div className="store-shell">
      <CommerceHeader />

      <main className="product-detail-page" id="main-content">
        <nav className="store-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <Link href="/products">Products</Link>
          <span>›</span>
          {group ? (
            <>
              <Link href={"/products?group=" + group.slug}>{group.name}</Link>
              <span>›</span>
            </>
          ) : null}
          <strong>{product.name}</strong>
        </nav>

        <section className="product-detail-grid">
          <ProductGallery images={images} productName={product.name} />

          <div className="product-detail-copy">
            <p className="product-detail-category">
              {group?.name ?? "MM Rashid & Co."}
            </p>
            <h1>{product.name}</h1>
            <div className="product-meta-line">
              {product.sku ? <span>SKU: {product.sku}</span> : null}
              <span className={"stock-text stock-" + product.stock_status}>
                {product.stock_status === "in_stock"
                  ? "In stock"
                  : product.stock_status === "out_of_stock"
                    ? "Out of stock"
                    : "Made to order"}
              </span>
            </div>

            {product.short_description ? (
              <p className="product-lead">{product.short_description}</p>
            ) : null}

            <ProductShare name={product.name} />

            <ProductPurchase
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                stock_status: product.stock_status,
                sizes: product.sizes ?? [],
                colors: product.colors ?? [],
                public_price: product.price_on_request
                  ? null
                  : product.public_price,
                price_on_request: product.price_on_request,
              }}
              currency={shop.currency}
              maxQuantity={shop.max_quantity}
            />
            <div className="product-description">
              <h2>Product details</h2>
              <p>
                {product.description ??
                  "Made to customer specification with careful attention to material, finish and construction."}
              </p>
            </div>

            {staticSpecifications.length ? (
              <div className="product-specifications">
                <h2>Specifications</h2>
                <dl>
                  {staticSpecifications.map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
            <div className="atelier-accordions product-help">
              <details>
                <summary>
                  Measurements &amp; customisation<span>+</span>
                </summary>
                <p>
                  Include your dimensions and units, materials, finish and
                  required quantity. For headwear, confirm the sizing method
                  with our team before production.{" "}
                  <Link
                    className="text-link"
                    href="/journal/preparing-your-commission"
                  >
                    Read the commission guide
                  </Link>
                  .
                </p>
              </details>
              <details>
                <summary>
                  Production &amp; delivery<span>+</span>
                </summary>
                <p>
                  Production time and delivery charges are confirmed in your
                  individual quotation. Please share your required date and
                  destination before approving your order.
                </p>
              </details>
              <details>
                <summary>
                  Care &amp; order terms<span>+</span>
                </summary>
                <p>
                  Protect embroidered surfaces from moisture and friction. Ask
                  for advice before cleaning. Read our{" "}
                  <Link
                    className="text-link"
                    href="/journal/caring-for-bullion-embroidery"
                  >
                    care guide
                  </Link>{" "}
                  and{" "}
                  <Link className="text-link" href="/terms">
                    order terms
                  </Link>
                  .
                </p>
              </details>
            </div>
          </div>
        </section>

        {related.length ? (
          <section className="store-section related-products">
            <div className="store-section-heading">
              <div>
                <p className="store-kicker">More products</p>
                <h2>Related pieces</h2>
              </div>
              <Link href="/products">View all →</Link>
            </div>
            <div className="store-product-grid">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <StoreFooter />
    </div>
  );
}

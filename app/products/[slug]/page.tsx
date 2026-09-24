import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductDetailBuybox } from "@/components/product-detail-buybox";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ slug: string }> };

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description:
      product.short_description ??
      product.description ??
      "Custom handcrafted ceremonial regalia by MM Rashid & Co.",
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const product = await getProduct(slug);
  if (!product) notFound();

  const [variantsResult, relatedResult] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, label, price_pkr, price_usd")
      .eq("product_id", product.id)
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, slug, sku, short_description, primary_image, price_pkr, price_usd, previous_price_pkr, previous_price_usd, price_on_request, stock_status")
      .eq("active", true)
      .neq("id", product.id)
      .order("sort_order", { ascending: true })
      .limit(4),
  ]);

  const variants = variantsResult.data ?? [];
  const related = (relatedResult.data ?? []) as ProductCardData[];
  const images = Array.from(
    new Set([product.primary_image, ...(product.images ?? [])].filter(Boolean)),
  ) as string[];
  const specifications =
    product.specifications && typeof product.specifications === "object"
      ? Object.entries(product.specifications as Record<string, unknown>)
      : [];

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

      <main className="product-detail-page">
        <nav className="store-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span>›</span>
          <Link href="/products">Products</Link><span>›</span>
          <strong>{product.name}</strong>
        </nav>

        <section className="product-detail-grid">
          <div className="product-gallery">
            <div className="product-main-image">
              {images[0] ? (
                <img src={images[0]} alt={product.name} />
              ) : (
                <div className="store-image-placeholder">MM RASHID & CO.</div>
              )}
            </div>
            {images.length > 1 ? (
              <div className="product-thumbnails">
                {images.map((image, index) => (
                  <a href={image} key={image} target="_blank" rel="noreferrer">
                    <img src={image} alt={product.name + " view " + (index + 1)} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="product-detail-copy">
            <p className="product-detail-category">MM Rashid &amp; Co.</p>
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

            {product.short_description ? <p className="product-lead">{product.short_description}</p> : null}

            <ProductDetailBuybox
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                primary_image: product.primary_image,
                price_pkr: product.price_pkr,
                price_usd: product.price_usd,
                price_on_request: product.price_on_request,
                stock_status: product.stock_status,
              }}
              variants={variants}
            />

            <div className="product-description">
              <h2>Product details</h2>
              <p>
                {product.description ??
                  "This item is made to customer specification. Contact us with artwork, quantity and required finish."}
              </p>
            </div>

            {specifications.length ? (
              <div className="product-specifications">
                <h2>Specifications</h2>
                <dl>
                  {specifications.map(([key, value]) => (
                    <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </section>

        {related.length ? (
          <section className="store-section related-products">
            <div className="store-section-heading">
              <div><p className="store-kicker">More products</p><h2>You may also like</h2></div>
              <Link href="/products">View all →</Link>
            </div>
            <div className="store-product-grid">
              {related.map((item) => <ProductCard key={item.id} product={item} />)}
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

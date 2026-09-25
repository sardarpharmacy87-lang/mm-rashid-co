import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommerceHeader } from "@/components/commerce-header";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";
import { submitProductEnquiry } from "./actions";

type PageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ enquiry?: string }> };

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
      "Ceremonial regalia by MM Rashid & Co.",
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { enquiry } = await searchParams;
  const supabase = await createClient();
  const product = await getProduct(slug);
  if (!product) notFound();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: customerProfile } = user
    ? await supabase.from("profiles").select("country").eq("id", user.id).maybeSingle()
    : { data: null };

  const [variantsResult, relatedResult, groupResult] = await Promise.all([
    supabase
      .from("product_variants")
      .select("id, label")
      .eq("product_id", product.id)
      .eq("active", true)
      .order("sort_order", { ascending: true }),
    product.product_group_id
      ? supabase
          .from("products")
          .select("id, name, slug, sku, short_description, primary_image, stock_status")
          .eq("active", true)
          .eq("product_group_id", product.product_group_id)
          .neq("id", product.id)
          .order("sort_order", { ascending: true })
          .limit(4)
      : supabase
          .from("products")
          .select("id, name, slug, sku, short_description, primary_image, stock_status")
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

  const variants = variantsResult.data ?? [];
  const related = (relatedResult.data ?? []) as ProductCardData[];
  const group = groupResult.data as { id: string; name: string; slug: string } | null;
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
            <p className="product-detail-category">{group?.name ?? "MM Rashid & Co."}</p>
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
            {variants.length ? (
              <div className="product-specifications">
                <h2>Available options / sizes</h2>
                <ul>
                  {variants.map((variant) => <li key={variant.id}>{variant.label}</li>)}
                </ul>
              </div>
            ) : null}

            <div className="product-rate-request">
              <p className="store-kicker">Made-to-order pricing</p>
              <h2>Request a rate</h2>
              <p>Tell us the quantity you need. We will review the specification and send you the rate that applies to that quantity.</p>

              {enquiry === "sent" ? <p className="rate-request-success">Your rate request has been submitted. We will send your quotation through your customer account.</p> : null}
              {enquiry === "invalid" ? <p className="rate-request-error">Please enter a valid quantity and delivery country.</p> : null}
              {enquiry === "error" ? <p className="rate-request-error">Your request could not be submitted. Please try again.</p> : null}

              {user ? (
                <form action={submitProductEnquiry} className="product-rate-form">
                  <input type="hidden" name="product_id" value={product.id} />
                  <input type="hidden" name="slug" value={product.slug} />
                  <label>
                    Quantity
                    <input name="quantity" type="number" min="1" step="1" defaultValue="1" required />
                  </label>
                  <label>
                    Delivery country
                    <input name="delivery_country" type="text" defaultValue={customerProfile?.country ?? ""} placeholder="e.g. United Kingdom" required />
                  </label>
                  <label>
                    Required by <span>(optional)</span>
                    <input name="required_by" type="date" />
                  </label>
                  <label className="rate-notes">
                    Requirements / notes <span>(optional)</span>
                    <textarea name="notes" rows={4} placeholder="Size, colour, material, badge artwork, packing or other requirements" />
                  </label>
                  <button className="store-primary-button" type="submit">Request rate</button>
                </form>
              ) : (
                <div className="rate-login-actions">
                  <Link className="store-primary-button" href="/sign-in?message=Sign in to request a rate.">Sign in to request rate</Link>
                  <Link className="store-secondary-button" href="/sign-up">Create account</Link>
                </div>
              )}
            </div>

            <div className="product-description">
              <h2>Product details</h2>
              <p>
                {product.description ??
                  "Made to customer specification with careful attention to material, finish and construction."}
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
              <div><p className="store-kicker">More products</p><h2>Related pieces</h2></div>
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

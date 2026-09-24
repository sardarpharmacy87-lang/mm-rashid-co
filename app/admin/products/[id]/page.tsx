import Link from "next/link";
import { notFound } from "next/navigation";
import { updateProduct } from "@/app/admin/products/actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function EditProductPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const feedback = await searchParams;
  const supabase = await createClient();

  const [productResult, variantsResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("product_variants").select("*").eq("product_id", id).order("sort_order", { ascending: true }),
  ]);

  const product = productResult.data;
  if (!product) notFound();
  const variants = variantsResult.data ?? [];

  const specs =
    product.specifications && typeof product.specifications === "object"
      ? Object.entries(product.specifications as Record<string, unknown>)
          .map(([key, value]) => key + ": " + String(value))
          .join("\n")
      : "";

  const variantText = variants
    .map((variant) => variant.label + "|" + (variant.price_pkr ?? "") + "|" + (variant.price_usd ?? ""))
    .join("\n");

  return (
    <main className="portal-main portal-narrow">
      <Link className="back-link" href="/admin/products">← Products</Link>

      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Edit product</p>
          <h1>{product.name}</h1>
          <p>{product.sku ?? product.slug}</p>
        </div>
        <Link className="portal-button" href={"/products/" + product.slug}>View product</Link>
      </div>

      {feedback.error ? <p className="form-alert form-alert-error">{feedback.error}</p> : null}
      {feedback.message ? <p className="form-alert form-alert-success">{feedback.message}</p> : null}

      <form action={updateProduct} className="portal-form portal-card commerce-admin-form">
        <input type="hidden" name="productId" value={product.id} />

        <div className="form-grid">
          <label>Product name<input name="name" required defaultValue={product.name} /></label>
          <label>SKU<input name="sku" defaultValue={product.sku ?? ""} /></label>
          <label>Slug<input name="slug" defaultValue={product.slug} /></label>
          <label>Sort order<input name="sortOrder" type="number" defaultValue={product.sort_order ?? 0} /></label>
          <label>PKR price<input name="pricePkr" type="number" min="0" step="0.01" defaultValue={product.price_pkr ?? ""} /></label>
          <label>USD price<input name="priceUsd" type="number" min="0" step="0.01" defaultValue={product.price_usd ?? ""} /></label>
          <label>Previous PKR price<input name="previousPricePkr" type="number" min="0" step="0.01" defaultValue={product.previous_price_pkr ?? ""} /></label>
          <label>Previous USD price<input name="previousPriceUsd" type="number" min="0" step="0.01" defaultValue={product.previous_price_usd ?? ""} /></label>
          <label>Stock status<select name="stockStatus" defaultValue={product.stock_status}><option value="made_to_order">Made to order</option><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option></select></label>
          <label className="form-span-two">Short description<input name="shortDescription" defaultValue={product.short_description ?? ""} /></label>
          <label className="form-span-two">Full description<textarea name="description" rows={5} defaultValue={product.description ?? ""} /></label>
          <label className="form-span-two">Upload more images (maximum five total)<input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple /></label>
          <label className="form-span-two">Current image URLs, one per line<textarea name="imageUrls" rows={5} defaultValue={(product.images ?? []).join("\n")} /></label>
          <label className="form-span-two">Specifications<textarea name="specifications" rows={6} defaultValue={specs} /></label>
          <label className="form-span-two">Options / sizes — Label|PKR|USD<textarea name="variants" rows={6} defaultValue={variantText} /></label>
        </div>

        <div className="admin-check-row">
          <label><input name="priceOnRequest" type="checkbox" defaultChecked={product.price_on_request} /> Price on request</label>
          <label><input name="featured" type="checkbox" defaultChecked={product.featured} /> Featured product</label>
          <label><input name="active" type="checkbox" defaultChecked={product.active} /> Active / visible</label>
        </div>

        <button className="portal-button" type="submit">Save product changes</button>
      </form>
    </main>
  );
}

import Link from "next/link";
import { createProduct, deleteProduct } from "@/app/admin/products/actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  primary_image: string | null;
  price_pkr: number | null;
  price_usd: number | null;
  price_on_request: boolean;
  stock_status: string;
  active: boolean;
  featured: boolean;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const feedback = await searchParams;
  const supabase = await createClient();

  const result = await supabase
    .from("products")
    .select("id, name, slug, sku, primary_image, price_pkr, price_usd, price_on_request, stock_status, active, featured")
    .order("sort_order", { ascending: true });

  const products = (result.data ?? []) as AdminProduct[];

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Product administration</p>
          <h1>Products</h1>
          <p>Add products, prices, options, stock status, specifications and images.</p>
        </div>
        <Link className="portal-button" href="/">View website</Link>
      </div>

      {feedback.error ? <p className="form-alert form-alert-error">{feedback.error}</p> : null}
      {feedback.message ? <p className="form-alert form-alert-success">{feedback.message}</p> : null}

      <section className="summary-grid">
        <article><strong>{products.length}</strong><span>Products</span></article>
        <article><strong>{products.filter((item) => item.featured).length}</strong><span>Featured</span></article>
        <article><strong>{products.filter((item) => item.active).length}</strong><span>Live</span></article>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <div>
            <h2>Add product</h2>
            <p>No brand, category or subcategory fields.</p>
          </div>
        </div>

        <form action={createProduct} className="portal-form portal-card commerce-admin-form">
          <div className="form-grid">
            <label>Product name<input name="name" required /></label>
            <label>SKU<input name="sku" placeholder="MMR-..." /></label>
            <label>Slug<input name="slug" placeholder="auto-created if blank" /></label>
            <label>Sort order<input name="sortOrder" type="number" defaultValue="0" /></label>
            <label>PKR price<input name="pricePkr" type="number" min="0" step="0.01" /></label>
            <label>USD price<input name="priceUsd" type="number" min="0" step="0.01" /></label>
            <label>Previous PKR price<input name="previousPricePkr" type="number" min="0" step="0.01" /></label>
            <label>Previous USD price<input name="previousPriceUsd" type="number" min="0" step="0.01" /></label>
            <label>
              Stock status
              <select name="stockStatus" defaultValue="made_to_order">
                <option value="made_to_order">Made to order</option>
                <option value="in_stock">In stock</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </label>
            <label className="form-span-two">Short description<input name="shortDescription" /></label>
            <label className="form-span-two">Full description<textarea name="description" rows={5} /></label>
            <label className="form-span-two">Product images (1-5)<input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple /></label>
            <label className="form-span-two">Existing image URLs<textarea name="imageUrls" rows={3} /></label>
            <label className="form-span-two">Specifications<textarea name="specifications" rows={5} placeholder={"Material: Velvet\nFinish: Gold bullion"} /></label>
            <label className="form-span-two">Options / sizes — Label|PKR|USD<textarea name="variants" rows={5} placeholder={"Small|15000|55\nLarge|19000|68"} /></label>
          </div>

          <div className="admin-check-row">
            <label><input name="priceOnRequest" type="checkbox" defaultChecked /> Price on request</label>
            <label><input name="featured" type="checkbox" /> Featured product</label>
            <label><input name="active" type="checkbox" defaultChecked /> Active / visible</label>
          </div>

          <button className="portal-button" type="submit">Add product</button>
        </form>
      </section>

      <section className="portal-section">
        <div className="portal-section-head"><h2>Current products</h2></div>

        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr><th>Product</th><th>Pricing</th><th>Stock</th><th>Visibility</th><th /></tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-product-cell">
                      {product.primary_image ? <img src={product.primary_image} alt="" /> : null}
                      <div>
                        <strong>{product.name}</strong>
                        <small>{product.sku || product.slug}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    {product.price_on_request
                      ? "On request"
                      : "PKR " + (product.price_pkr ?? "—") + " / USD " + (product.price_usd ?? "—")}
                  </td>
                  <td>{product.stock_status.split("_").join(" ")}</td>
                  <td>{product.active ? "Live" : "Hidden"}{product.featured ? " · Featured" : ""}</td>
                  <td className="admin-row-actions">
                    <Link href={"/admin/products/" + product.id}>Edit</Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="productId" value={product.id} />
                      <button type="submit">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

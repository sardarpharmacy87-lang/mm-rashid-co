import Link from "next/link";
import { createCategory, createProduct, deleteProduct } from "@/app/admin/products/actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = { searchParams: Promise<{ error?: string; message?: string }> };

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const feedback = await searchParams;
  const supabase = await createClient();
  const [categoriesResult, productsResult] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, slug, sku, primary_image, price_pkr, price_usd, price_on_request, stock_status, active, featured, categories(name)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
  ]);

  const categories = categoriesResult.data ?? [];
  const products = productsResult.data ?? [];

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Catalogue administration</p>
          <h1>Products &amp; categories</h1>
          <p>Add products, pricing, sizes, stock status and product images.</p>
        </div>
        <Link className="portal-button" href="/">View website</Link>
      </div>

      {feedback.error ? <p className="form-alert form-alert-error">{feedback.error}</p> : null}
      {feedback.message ? <p className="form-alert form-alert-success">{feedback.message}</p> : null}

      <section className="summary-grid">
        <article><strong>{products.length}</strong><span>Products</span></article>
        <article><strong>{categories.length}</strong><span>Categories</span></article>
        <article><strong>{products.filter((product) => product.featured).length}</strong><span>Featured</span></article>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <div><h2>Add category</h2><p>Categories appear in the blue navigation bar and catalogue filters.</p></div>
        </div>
        <form action={createCategory} className="portal-form portal-card commerce-admin-form">
          <div className="form-grid">
            <label>Category name<input name="name" required placeholder="e.g. Collars & Regalia" /></label>
            <label>Slug<input name="slug" placeholder="auto-created if blank" /></label>
            <label>Sort order<input name="sortOrder" type="number" defaultValue="0" /></label>
            <label>Image URL<input name="imageUrl" placeholder="/images/..." /></label>
            <label className="form-span-two">Description<textarea name="description" rows={3} /></label>
          </div>
          <button className="portal-button" type="submit">Add category</button>
        </form>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <div><h2>Add product</h2><p>Upload up to five images and set pricing in PKR and USD.</p></div>
        </div>
        <form action={createProduct} className="portal-form portal-card commerce-admin-form">
          <div className="form-grid">
            <label>Product name<input name="name" required /></label>
            <label>SKU<input name="sku" placeholder="MMR-..." /></label>
            <label>Category<select name="categoryId" defaultValue=""><option value="">Uncategorized</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
            <label>Slug<input name="slug" placeholder="auto-created if blank" /></label>
            <label>PKR price<input name="pricePkr" type="number" min="0" step="0.01" /></label>
            <label>USD price<input name="priceUsd" type="number" min="0" step="0.01" /></label>
            <label>Previous PKR price<input name="previousPricePkr" type="number" min="0" step="0.01" /></label>
            <label>Previous USD price<input name="previousPriceUsd" type="number" min="0" step="0.01" /></label>
            <label>Stock status<select name="stockStatus" defaultValue="made_to_order"><option value="made_to_order">Made to order</option><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option></select></label>
            <label>Sort order<input name="sortOrder" type="number" defaultValue="0" /></label>
            <label className="form-span-two">Short description<input name="shortDescription" /></label>
            <label className="form-span-two">Full description<textarea name="description" rows={5} /></label>
            <label className="form-span-two">Product images (1-5)<input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple /></label>
            <label className="form-span-two">Existing/image URLs, one per line<textarea name="imageUrls" rows={3} placeholder="/images/gallery/example.webp" /></label>
            <label className="form-span-two">Specifications, one per line<textarea name="specifications" rows={5} placeholder={"Material: Velvet\nFinish: Gold bullion\nMade in: Sialkot"} /></label>
            <label className="form-span-two">Options / sizes — Label|PKR|USD, one per line<textarea name="variants" rows={5} placeholder={"Small|15000|55\nLarge|19000|68"} /></label>
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
            <thead><tr><th>Product</th><th>Category</th><th>Pricing</th><th>Status</th><th>Visibility</th><th /></tr></thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-product-cell">
                      {product.primary_image ? <img src={product.primary_image} alt="" /> : null}
                      <div><strong>{product.name}</strong><small>{product.sku ?? product.slug}</small></div>
                    </div>
                  </td>
                  <td>{product.categories?.name ?? "—"}</td>
                  <td>{product.price_on_request ? "On request" : "PKR " + (product.price_pkr ?? "—") + " / USD " + (product.price_usd ?? "—")}</td>
                  <td>{product.stock_status.replaceAll("_", " ")}</td>
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

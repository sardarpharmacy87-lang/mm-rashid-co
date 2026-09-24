import Link from "next/link";
import {
  createProduct,
  createProductGroup,
  deleteProduct,
  deleteProductGroup,
} from "@/app/admin/products/actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

type ProductGroup = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
};

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  primary_image: string | null;
  stock_status: string;
  active: boolean;
  featured: boolean;
  product_group_id: string | null;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const feedback = await searchParams;
  const supabase = await createClient();

  const [productsResult, groupsResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, slug, sku, primary_image, stock_status, active, featured, product_group_id")
      .order("sort_order", { ascending: true }),
    supabase
      .from("product_groups")
      .select("id, name, slug, sort_order, active")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const products = (productsResult.data ?? []) as AdminProduct[];
  const groups = (groupsResult.data ?? []) as ProductGroup[];
  const groupNameById = new Map(groups.map((group) => [group.id, group.name]));

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Product administration</p>
          <h1>Products</h1>
          <p>Create the names you want customers to browse, then place each product under one of them.</p>
        </div>
        <Link className="portal-button" href="/">View website</Link>
      </div>

      {feedback.error ? <p className="form-alert form-alert-error">{feedback.error}</p> : null}
      {feedback.message ? <p className="form-alert form-alert-success">{feedback.message}</p> : null}

      <section className="summary-grid">
        <article><strong>{products.length}</strong><span>Products</span></article>
        <article><strong>{groups.length}</strong><span>Product groups</span></article>
        <article><strong>{products.filter((item) => item.active).length}</strong><span>Live</span></article>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <div>
            <h2>Product groups</h2>
            <p>Customers will see only these names, for example Fez, Caps or Jackets.</p>
          </div>
        </div>

        <form action={createProductGroup} className="portal-form portal-card commerce-admin-form">
          <div className="form-grid">
            <label>Name<input name="groupName" required placeholder="Fez" /></label>
            <label>Slug<input name="groupSlug" placeholder="auto-created if blank" /></label>
            <label>Order<input name="groupSortOrder" type="number" defaultValue="0" /></label>
          </div>
          <button className="portal-button" type="submit">Add name</button>
        </form>

        {groups.length ? (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr><th>Name</th><th>Link</th><th>Order</th><th /></tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td><strong>{group.name}</strong></td>
                    <td><Link href={"/products?group=" + group.slug}>/{group.slug}</Link></td>
                    <td>{group.sort_order}</td>
                    <td className="admin-row-actions">
                      <form action={deleteProductGroup}>
                        <input type="hidden" name="groupId" value={group.id} />
                        <button type="submit">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <div>
            <h2>Add product</h2>
            <p>Choose where it should appear, then add its product details and images.</p>
          </div>
        </div>

        <form action={createProduct} className="portal-form portal-card commerce-admin-form">
          <div className="form-grid">
            <label>Product name<input name="name" required /></label>
            <label>SKU<input name="sku" placeholder="MMR-..." /></label>
            <label>
              Show under
              <select name="productGroupId" defaultValue="">
                <option value="">Choose a name</option>
                {groups.map((group) => (
                  <option value={group.id} key={group.id}>{group.name}</option>
                ))}
              </select>
            </label>
            <label>Slug<input name="slug" placeholder="auto-created if blank" /></label>
            <label>Sort order<input name="sortOrder" type="number" defaultValue="0" /></label>
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
            <label className="form-span-two">Options / sizes — one per line<textarea name="variants" rows={5} placeholder={"Small\nLarge\nCustom size"} /></label>
          </div>

          <div className="admin-check-row">
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
              <tr><th>Product</th><th>Under</th><th>Stock</th><th>Visibility</th><th /></tr>
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
                  <td>{product.product_group_id ? groupNameById.get(product.product_group_id) ?? "—" : "—"}</td>
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

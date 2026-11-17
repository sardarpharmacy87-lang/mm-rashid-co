import Image from "next/image";
import { redirect } from "next/navigation";
import { AdminProductForm } from "@/components/admin-product-form";
import Link from "next/link";
import { AdminProductOptions } from "@/components/admin-product-options";
import { getShopSettings } from "@/lib/shop";
import {
  createProduct,
  createProductGroup,
  deleteProduct,
  deleteProductGroup,
} from "@/app/admin/products/actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ error?: string; message?: string; page?: string; q?: string }>;
};

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const feedback = await searchParams;

  const supabase = await createClient();

  const requestedPage = Number(feedback.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 10000 ? requestedPage : 1;
  const pageSize = 25;
  const search = (feedback.q ?? "").trim().slice(0, 200);
  const safeSearch = search.replace(/[(),%_\\"]/g, " ");
  let query = supabase.from("products").select(
    "id, name, slug, sku, primary_image, stock_status, active, featured, product_group_id",
    { count: "exact" },
  );
  if (safeSearch) query = query.or("name.ilike.%" + safeSearch + "%,sku.ilike.%" + safeSearch + "%");
  const [productsResult, groupsResult, totalResult, liveResult, shop] = await Promise.all([
    query.order("sort_order").order("name").order("id").range((page - 1) * pageSize, page * pageSize - 1),
    supabase.from("product_groups").select("id, name, slug, sort_order, active").order("sort_order").order("name"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
    getShopSettings(),
  ]);
  const pageCount = Math.max(1, Math.ceil((productsResult.count ?? 0) / pageSize));
  const pageHref = (number: number) => "/admin/products?" + new URLSearchParams({ page: String(number), ...(search ? { q: search } : {}) }).toString();
  if (!productsResult.error && page > pageCount) redirect(pageHref(pageCount));

  const products = (productsResult.data ?? []) as {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    primary_image: string | null;
    stock_status: string;
    active: boolean;
    featured: boolean;
    product_group_id: string | null;
  }[];
  const groups = (groupsResult.data ?? []) as {
    id: string;
    name: string;
    slug: string;
    sort_order: number;
    active: boolean;
  }[];
  const groupNameById = new Map(groups.map((group) => [group.id, group.name]));

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Product administration</p>
          <h1>Products</h1>
          <p>
            Create the names you want customers to browse, then place each
            product under one of them.
          </p>
        </div>
        <Link className="portal-button" href="/">
          View website
        </Link>
      </div>

      {feedback.error ? (
        <p className="form-alert form-alert-error">{feedback.error}</p>
      ) : null}
      {feedback.message ? (
        <p className="form-alert form-alert-success">{feedback.message}</p>
      ) : null}

      <section className="summary-grid">
        <article>
          <strong>{totalResult.count ?? 0}</strong>
          <span>Products</span>
        </article>
        <article>
          <strong>{groups.length}</strong>
          <span>Sections</span>
        </article>
        <article>
          <strong>{liveResult.count ?? 0}</strong>
          <span>Live</span>
        </article>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <div>
            <h2>Product sections</h2>
            <p>
              Create only the names customers should see, for example Fez, Caps
              or Jackets.
            </p>
          </div>
        </div>

        <form
          action={createProductGroup}
          className="portal-form portal-card commerce-admin-form"
        >
          <div className="form-grid">
            <label>
              Name
              <input name="groupName" required placeholder="Fez" />
            </label>
            <label>
              Slug
              <input name="groupSlug" placeholder="auto-created if blank" />
            </label>
            <label>
              Order
              <input name="groupSortOrder" type="number" defaultValue="0" />
            </label>
          </div>
          <button className="portal-button" type="submit">
            Add name
          </button>
        </form>

        {groups.length ? (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Link</th>
                  <th>Order</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id}>
                    <td>
                      <strong>{group.name}</strong>
                    </td>
                    <td>
                      <Link href={"/products?group=" + group.slug}>
                        /{group.slug}
                      </Link>
                    </td>
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
            <p>
              Choose where it should appear, then add its product details and
              images.
            </p>
          </div>
        </div>

        <AdminProductForm
          action={createProduct}
          className="portal-form portal-card commerce-admin-form"
        >
          <div className="form-grid">
            <label>
              Product name
              <input name="name" required />
            </label>
            <label>
              SKU
              <input name="sku" placeholder="MMR-..." />
            </label>
            <label>
              Show under
              <select name="productGroupId" defaultValue="">
                <option value="">Choose a name</option>
                {groups.map((group) => (
                  <option value={group.id} key={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Slug
              <input name="slug" placeholder="auto-created if blank" />
            </label>
            <label>
              Sort order
              <input name="sortOrder" type="number" defaultValue="0" />
            </label>
            <label>
              Stock status
              <select name="stockStatus" defaultValue="made_to_order">
                <option value="made_to_order">Made to order</option>
                <option value="in_stock">In stock</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </label>
            <label className="form-span-two">
              Short description
              <input name="shortDescription" />
            </label>
            <label className="form-span-two">
              Full description
              <textarea name="description" rows={5} />
            </label>
            <label className="form-span-two">
              Product images (1-5)
              <input
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
              />
            </label>
            <label className="form-span-two">
              Existing image URLs
              <textarea name="imageUrls" rows={3} />
            </label>
            <label className="form-span-two">
              Specifications
              <textarea
                name="specifications"
                rows={5}
                placeholder={"Material: Velvet\nFinish: Gold bullion"}
              />
            </label>
            <AdminProductOptions currency={shop.currency} />
          </div>

          <div className="admin-check-row">
            <label>
              <input name="active" type="checkbox" defaultChecked /> Active /
              visible
            </label>
          </div>

          <button className="portal-button" type="submit">
            Add product
          </button>
        </AdminProductForm>
      </section>

      <section className="portal-section">
        <div className="portal-section-head">
          <h2>Current products</h2>
          <form action="/admin/products" className="portal-form">
            <label>Search by product name or SKU<input name="q" type="search" defaultValue={search} /></label>
            <button className="portal-button" type="submit">Search</button>
          </form>
        </div>

        {productsResult.error ? <p role="alert">Unable to load products. Please reload.</p> : products.length ? (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Under</th>
                  <th>Stock</th>
                  <th>Visibility</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        {product.primary_image ? (
                          <Image src={product.primary_image} alt="" width={64} height={64} sizes="64px" loading="lazy" style={{ objectFit: "contain" }} />
                        ) : null}
                        <div>
                          <strong>{product.name}</strong>
                          <small>{product.sku || product.slug}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {product.product_group_id
                        ? (groupNameById.get(product.product_group_id) ?? "—")
                        : "—"}
                    </td>
                    <td>{product.stock_status.split("_").join(" ")}</td>
                    <td>
                      {product.active ? "Live" : "Hidden"}
                      {product.featured ? " · Featured" : ""}
                    </td>
                    <td className="admin-row-actions">
                      <Link href={"/admin/products/" + product.id}>Edit</Link>
                      <form action={deleteProduct}>
                        <input
                          type="hidden"
                          name="productId"
                          value={product.id}
                        />
                        <button type="submit">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="portal-empty admin-products-empty">
            <strong>{search ? "No matching products." : "No products added yet."}</strong>
            <p>{search ? "Try another name or SKU." : "Your real products will appear here after you add them above."}</p>
          </div>
        )}
        {!productsResult.error && pageCount > 1 && (
          <nav className="catalogue-pagination" aria-label="Admin product pages">
            {page > 1 ? <Link href={pageHref(page - 1)}>← Previous</Link> : <span />}
            <span>Page {page} of {pageCount}</span>
            {page < pageCount ? <Link href={pageHref(page + 1)}>Next →</Link> : <span />}
          </nav>
        )}
      </section>
    </main>
  );
}

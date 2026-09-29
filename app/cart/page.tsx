import { createClient } from "@/lib/supabase/server";
import { getShopSettings } from "@/lib/shop";
import { ShoppingCart } from "@/components/shopping-cart";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
export const metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};
export default async function CartPage() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  const [settings, { data: products }, { data: profile }, { data: methods }] =
    await Promise.all([
      getShopSettings(),
      db
        .from("products")
        .select(
          "id,name,slug,stock_status,sizes,colors,public_price,price_on_request",
        )
        .eq("active", true),
      user
        ? db
            .from("profiles")
            .select("full_name,phone,country,city,address,postal_code")
            .eq("id", user.id)
            .single()
        : Promise.resolve({ data: null }),
      user ? db.rpc("checkout_methods") : Promise.resolve({ data: [] }),
    ]);
  return (
    <div className="store-shell">
      <CommerceHeader />
      <main className="editorial-page" id="main-content">
        <p className="eyebrow">Your selection</p>
        <h1 className="editorial-title">Your cart.</h1>
        <p className="editorial-intro">
          Review sizes, colors and quantities. Buy products with a listed price,
          or request a quotation for custom work.
        </p>
        <ShoppingCart
          products={products ?? []}
          settings={settings}
          profile={profile}
          signedIn={!!user}
          methods={methods ?? []}
        />
      </main>
      <StoreFooter />
    </div>
  );
}

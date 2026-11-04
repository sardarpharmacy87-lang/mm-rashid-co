import { getCurrentUser } from "@/lib/auth";
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
  const settingsPromise = getShopSettings();
  const user = await getCurrentUser();
  const [settings, { data: profile }, { data: methods }] = await Promise.all([
    settingsPromise,
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

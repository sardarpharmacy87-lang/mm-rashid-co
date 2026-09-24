import { Suspense } from "react";
import { CartClient } from "@/app/cart/cart-client";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Quotation Basket | MM Rashid & Co.",
  description: "Review selected MM Rashid & Co. products and request a custom quotation.",
};

export default async function CartPage() {
  const supabase = await createClient();
  const { data: categories = [] } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="store-shell">
      <CommerceHeader categories={categories} />
      <main className="cart-page">
        <Suspense fallback={<div className="cart-empty">Loading basket…</div>}>
          <CartClient />
        </Suspense>
      </main>
      <StoreFooter />
    </div>
  );
}

import { Suspense } from "react";
import { CartClient } from "@/app/cart/cart-client";
import { CommerceHeader } from "@/components/commerce-header";
import { StoreFooter } from "@/components/store-footer";

export const metadata = {
  title: "Quotation Basket",
  description: "Review selected MM Rashid & Co. products and request a custom quotation.",
};

export default function CartPage() {
  return (
    <div className="store-shell">
      <CommerceHeader />
      <main className="cart-page">
        <Suspense fallback={<div className="cart-empty">Loading basket…</div>}>
          <CartClient />
        </Suspense>
      </main>
      <StoreFooter />
    </div>
  );
}

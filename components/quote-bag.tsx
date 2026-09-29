"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
export function BagLink() {
  const items = useCart();
  return (
    <Link href="/cart" aria-label={"Cart, " + items.length + " selections"}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8h14l1 13H4L5 8Z" />
        <path d="M8 9V6a4 4 0 0 1 8 0v3" />
      </svg>
      {items.length > 0 && <span className="bag-count">{items.length}</span>}
    </Link>
  );
}

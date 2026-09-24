"use client";

import Link from "next/link";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { useCommerce } from "@/components/commerce-provider";

export function CommerceHeader() {
  const { cartCount } = useCommerce();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="store-announcement">
        <span>Handcrafted ceremonial regalia since 1922</span>
        <span className="store-announcement-center">Worldwide custom enquiries · Made in Sialkot</span>
        <Link href="/customer/enquiries/new">Request a quotation</Link>
      </div>

      <header className="store-header">
        <div className="store-header-main">
          <Brand />

          <form className="store-search" action="/products" method="get">
            <input
              type="search"
              name="q"
              aria-label="Search products"
              placeholder="Search products..."
            />
            <button type="submit">Search</button>
          </form>

          <div className="store-tools">
            <Link className="store-tool-link" href="/sign-in">
              <span>Account</span>
              <strong>Sign in</strong>
            </Link>

            <Link className="store-cart-link" href="/cart" aria-label={"Quotation basket with " + cartCount + " items"}>
              <span className="store-cart-icon">Quote</span>
              <strong>{cartCount}</strong>
            </Link>

            <button
              className="store-menu-button"
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <nav className={"store-main-nav " + (open ? "is-open" : "")} aria-label="Main navigation">
          <Link href="/products" onClick={() => setOpen(false)}>Products</Link>
          <Link href="/#heritage" onClick={() => setOpen(false)}>Our history</Link>
          <Link href="/#workshop" onClick={() => setOpen(false)}>Workshop</Link>
          <Link href="/#process" onClick={() => setOpen(false)}>How we work</Link>
          <Link href="/#contact" onClick={() => setOpen(false)}>Contact</Link>
          <Link href="/sign-in" onClick={() => setOpen(false)}>My account</Link>
          <Link className="nav-quote-link" href="/customer/enquiries/new" onClick={() => setOpen(false)}>
            Custom enquiry
          </Link>
        </nav>
      </header>
    </>
  );
}

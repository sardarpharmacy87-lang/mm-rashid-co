"use client";

import Link from "next/link";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { useCommerce } from "@/components/commerce-provider";

type CategoryNav = { name: string; slug: string };

export function CommerceHeader({ categories }: { categories: CategoryNav[] }) {
  const { currency, setCurrency, cartCount } = useCommerce();
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
              placeholder="Search aprons, badges, caps, banners..."
            />
            <button type="submit">Search</button>
          </form>

          <div className="store-tools">
            <div className="currency-switch" aria-label="Currency">
              <button
                type="button"
                className={currency === "PKR" ? "is-active" : ""}
                onClick={() => setCurrency("PKR")}
              >
                PKR
              </button>
              <button
                type="button"
                className={currency === "USD" ? "is-active" : ""}
                onClick={() => setCurrency("USD")}
              >
                USD
              </button>
            </div>

            <Link className="store-tool-link" href="/sign-in">
              <span>Account</span>
              <strong>Sign in</strong>
            </Link>

            <Link className="store-cart-link" href="/cart" aria-label={"Cart with " + cartCount + " items"}>
              <span className="store-cart-icon">Bag</span>
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

        <nav className={"store-category-nav " + (open ? "is-open" : "")} aria-label="Product categories">
          <Link href="/products" onClick={() => setOpen(false)}>Shop all</Link>
          {categories.slice(0, 7).map((category) => (
            <Link
              key={category.slug}
              href={"/products?category=" + encodeURIComponent(category.slug)}
              onClick={() => setOpen(false)}
            >
              {category.name}
            </Link>
          ))}
          <Link href="/#heritage" onClick={() => setOpen(false)}>Our history</Link>
          <Link className="nav-quote-link" href="/customer/enquiries/new" onClick={() => setOpen(false)}>
            Custom enquiry
          </Link>
        </nav>
      </header>
    </>
  );
}

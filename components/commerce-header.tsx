"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";
import { useCommerce } from "@/components/commerce-provider";

export function CommerceHeader() {
  const { cartCount } = useCommerce();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <div className="bloom-ribbon">
        <span>Handcrafted ceremonial regalia · Sialkot · Since 1922</span>
        <Link href="/sign-in">Private customer portal ↗</Link>
      </div>

      <header className={"store-header bloom-header " + (scrolled ? "is-scrolled" : "")}>
        <div className="bloom-header-inner">
          <Brand />

          <nav
            id="bloom-main-navigation"
            className={"bloom-main-nav " + (open ? "is-open" : "")}
            aria-label="Main navigation"
          >
            <Link href="/products" onClick={close}>Products</Link>
            <Link href="/catalogue" onClick={close}>Catalogue</Link>
            <Link href="/#heritage" onClick={close}>Our history</Link>
            <Link href="/#workshop" onClick={close}>Workshop</Link>
            <Link href="/#process" onClick={close}>How we work</Link>
            <Link href="/#contact" onClick={close}>Contact</Link>
          </nav>

          <div className="bloom-header-actions">
            <form className="bloom-search" action="/products" method="get">
              <input type="search" name="q" aria-label="Search products" placeholder="Search" />
              <button type="submit" aria-label="Search products">↗</button>
            </form>

            <Link className="bloom-account" href="/sign-in">Account</Link>

            <Link className="bloom-quote" href="/cart" aria-label={"Commission brief with " + cartCount + " items"}>
              Commission
              <span>{cartCount}</span>
            </Link>

            <button
              className="store-menu-button bloom-menu-button"
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="bloom-main-navigation"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { Brand } from "@/components/brand";
import { LocaleControls } from "@/components/locale-controls";

type HeaderProps = {
  signedIn: boolean;
  role: "admin" | "customer" | null;
};

export function CommerceHeaderClient({ signedIn, role }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const close = () => setOpen(false);
  const portalHref = role === "admin" ? "/admin" : "/customer";
  const portalLabel = role === "admin" ? "Admin portal" : "Customer portal";

  return (
    <>
      <header className={"store-header bloom-header " + (scrolled ? "is-scrolled" : "")}>
        <div className="bloom-header-inner">
          <Brand />

          <nav
            id="bloom-main-navigation"
            className={"bloom-main-nav " + (open ? "is-open" : "")}
            aria-label="Main navigation"
          >
            <Link href="/products" onClick={close}>Products</Link>
            <Link href="/capabilities" onClick={close}>Capabilities</Link>
            <Link href="/catalogue" onClick={close}>Catalogue</Link>
            <Link href="/#heritage" onClick={close}>Our history</Link>
            <Link href="/#workshop" onClick={close}>Workshop</Link>
            <Link href="/contact" onClick={close}>Contact</Link>
          </nav>

          <div className="bloom-header-actions">
            <LocaleControls compact />
            <form className="bloom-search" action="/products" method="get">
              <input type="search" name="q" aria-label="Search products" placeholder="Search" />
              <button type="submit" aria-label="Search products">↗</button>
            </form>

            {signedIn ? (
              <>
                <Link className="bloom-account" href={portalHref}>{portalLabel}</Link>
                <form action={signOut} className="bloom-signout-form">
                  <button type="submit" className="bloom-signout">Sign out</button>
                </form>
              </>
            ) : (
              <Link className="bloom-account" href="/sign-in">Login</Link>
            )}

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

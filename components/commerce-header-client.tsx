"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { Brand } from "@/components/brand";
import { LocaleControls } from "@/components/locale-controls";
import { BagLink } from "@/components/quote-bag";
type Props = {
  signedIn: boolean;
  role: "admin" | "customer" | null;
  groups?: { id: string; name: string; slug: string }[];
};
export function CommerceHeaderClient({ signedIn, role, groups = [] }: Props) {
  const [open, setOpen] = useState(false);
  const collectionMenu = useRef<HTMLDetailsElement>(null);
  function closeMenu() {
    setOpen(false);
    if (collectionMenu.current) collectionMenu.current.open = false;
  }
  const [search, setSearch] = useState(false);
  return (
    <>
      <a className="atelier-skip" href="#main-content">
        Skip to content
      </a>
      <div className="atelier-topbar">
        <span>THE ART OF CEREMONIAL CRAFT · SINCE 1922</span>
        <Link href="/contact">Bespoke &amp; trade enquiries</Link>
      </div>
      <header className="atelier-header">
        <div className="atelier-masthead">
          <Link href="/contact" className="masthead-note">
            CRAFTED IN SIALKOT
            <br />
            <span>Commissioned worldwide</span>
          </Link>
          <Brand />
          <div className="atelier-tools">
            <button
              aria-label="Search products"
              onClick={() => setSearch(!search)}
              aria-expanded={search}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>
            </button>
            <Link
              href={
                signedIn
                  ? role === "admin"
                    ? "/admin"
                    : "/customer"
                  : "/sign-in"
              }
              aria-label={signedIn ? "My account" : "Sign in"}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
              </svg>
            </Link>
            <BagLink />
            <button
              className="atelier-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="atelier-navigation"
              onClick={() => setOpen(!open)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d={open ? "m5 5 14 14M5 19 19 5" : "M3 6h18M3 12h18M3 18h18"}
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="atelier-nav-row">
          <nav
            className={open ? "atelier-nav is-open" : "atelier-nav"}
            id="atelier-navigation"
            aria-label="Main navigation"
            onKeyDown={(e) => {
              if (e.key === "Escape") closeMenu();
            }}
          >
            <Link href="/" onClick={closeMenu}>
              Home
            </Link>
            <details className="atelier-mega" ref={collectionMenu}>
              <summary>
                Collections <span>⌄</span>
              </summary>
              <div className="atelier-mega-panel">
                <div>
                  <p className="eyebrow">Made with distinction</p>
                  <Link href="/collections" onClick={closeMenu}>
                    Explore all collections ↗
                  </Link>
                  <Link href="/products" onClick={closeMenu}>
                    All products
                  </Link>
                </div>
                <div>
                  {groups.map((g) => (
                    <Link
                      key={g.id}
                      href={"/products?group=" + g.slug}
                      onClick={closeMenu}
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              </div>
            </details>
            <Link href="/capabilities" onClick={closeMenu}>
              Our craft
            </Link>
            <Link href="/#heritage" onClick={closeMenu}>
              Heritage
            </Link>
            <Link href="/journal" onClick={closeMenu}>
              Journal
            </Link>
            <Link href="/catalogue" onClick={closeMenu}>
              Catalogue
            </Link>
            <Link href="/contact" onClick={closeMenu}>
              Contact
            </Link>
            {signedIn && (
              <form action={signOut}>
                <button type="submit">Sign out</button>
              </form>
            )}
          </nav>
          <LocaleControls compact />
        </div>
        {search && (
          <form className="atelier-search" action="/products">
            <label htmlFor="header-search">What are you looking for?</label>
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Search pieces, collections or product codes"
              autoFocus
            />
            <button type="submit">Search ↗</button>
            <button type="button" onClick={() => setSearch(false)}>
              Close
            </button>
          </form>
        )}
      </header>
    </>
  );
}

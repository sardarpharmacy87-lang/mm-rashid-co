"use client";

import { useState } from "react";
import { Brand } from "@/components/brand";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />

        <button
          className="menu-button"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="main-navigation"
          className={`main-navigation ${menuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          <a href="#heritage" onClick={closeMenu}>
            Our Heritage
          </a>

          <a href="#workshop" onClick={closeMenu}>
            Workshop
          </a>

          <a href="#craft" onClick={closeMenu}>
            Craft
          </a>

          <a href="#gallery" onClick={closeMenu}>
            Gallery
          </a>

          <a href="#process" onClick={closeMenu}>
            Process
          </a>

          <a href="/sign-in" onClick={closeMenu}>
            Account
          </a>

          <a
            className="header-enquiry"
            href="/sign-up"
            onClick={closeMenu}
          >
            Start an enquiry
          </a>
        </nav>
      </div>
    </header>
  );
}

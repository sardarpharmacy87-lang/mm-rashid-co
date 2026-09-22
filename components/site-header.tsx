"use client";

import { useEffect, useState } from "react";
import { Brand } from "@/components/brand";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 28);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-progress" aria-hidden="true" />

      <div className="header-inner">
        <Brand />

        <button
          className="menu-button"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
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
          <a href="#craft" onClick={closeMenu}>What we make</a>
          <a href="#gallery" onClick={closeMenu}>Selected work</a>
          <a href="#heritage" onClick={closeMenu}>Our history</a>
          <a href="#workshop" onClick={closeMenu}>Workshop</a>
          <a href="#faq" onClick={closeMenu}>FAQ</a>
          <a href="/sign-in" onClick={closeMenu}>Account</a>

          <a
            className="header-enquiry"
            href="/sign-up"
            onClick={closeMenu}
          >
            Send an enquiry
          </a>
        </nav>
      </div>
    </header>
  );
}

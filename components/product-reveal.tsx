"use client";

import { useState, type ReactNode, type CSSProperties } from "react";
import Image from "next/image";

export function ProductReveal({ children }: { children: ReactNode }) {
  const [reveal, setReveal] = useState(0);
  const [logoReady, setLogoReady] = useState(false);
  return (
    <div
      className="product-reveal"
      style={{ "--reveal": `${reveal}%` } as CSSProperties}
    >
      <div className="product-reveal-stage">
        {children}
        <div className="product-reveal-cloth" aria-hidden="true">
          <Image
            className={logoReady ? "reveal-logo is-ready" : "reveal-logo"}
            src="/images/royal/reveal-logo.webp"
            alt=""
            width={220}
            height={212}
            priority
            onLoad={() => setLogoReady(true)}
          />
          <span className="reveal-invitation">
            Slide to reveal
            <br />
            our featured piece
          </span>
        </div>
      </div>
      <div className="product-reveal-controls">
        <label htmlFor="hero-reveal">
          {reveal === 100 ? "Revealed" : "Slide to reveal"}{" "}
          <span aria-hidden="true">→</span>
        </label>
        <input
          id="hero-reveal"
          type="range"
          min="0"
          max="100"
          value={reveal}
          aria-label="Reveal featured product"
          aria-valuetext={`${reveal}% revealed`}
          disabled={reveal === 100}
          onChange={(event) =>
            setReveal((current) =>
              Math.max(current, Number(event.target.value)),
            )
          }
        />
        <button
          type="button"
          disabled={reveal === 100}
          onClick={() => setReveal(100)}
        >
          {reveal === 100 ? "Revealed ✓" : "Reveal"}
        </button>
      </div>
    </div>
  );
}

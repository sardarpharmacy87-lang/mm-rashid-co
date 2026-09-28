"use client";

import { useState, type ReactNode, type CSSProperties } from "react";
import Image from "next/image";

export function ProductReveal({ children }: { children?: ReactNode }) {
  const [reveal, setReveal] = useState(0);
  const [logoReady, setLogoReady] = useState(false);
  return (
    <div
      className="product-reveal"
      style={{ "--reveal": `${reveal}%` } as CSSProperties}
    >
      <div className="product-reveal-stage">
        {children || (
          <div className="product-reveal-identity" aria-hidden={reveal < 100}>
            <Image
              className={
                logoReady && reveal === 100
                  ? "reveal-logo is-ready"
                  : "reveal-logo"
              }
              src="/images/royal/reveal-logo.webp"
              alt="MM Rashid & Co."
              width={350}
              height={337}
              priority
              onLoad={() => setLogoReady(true)}
            />
          </div>
        )}
        <div className="product-reveal-cloth" aria-hidden="true">
          <span className="reveal-wordmark">MM RASHID &amp; CO.</span>
          <span className="reveal-invitation">
            Slide to reveal
            <br />
            {children ? "our featured piece" : "our signature"}
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
          aria-label={
            children ? "Reveal featured product" : "Reveal company logo"
          }
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

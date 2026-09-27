"use client";

import { useState, type ReactNode, type CSSProperties } from "react";

export function ProductReveal({ children }: { children: ReactNode }) {
  const [reveal, setReveal] = useState(72);
  return (
    <div
      className="product-reveal"
      style={{ "--reveal": `${reveal}%` } as CSSProperties}
    >
      <div className="product-reveal-stage">
        {children}
        <div className="product-reveal-cloth" aria-hidden="true">
          <span>MM RASHID &amp; CO.</span>
          <small>MADE IN SIALKOT</small>
        </div>
      </div>
      <div className="product-reveal-controls">
        <label htmlFor="hero-reveal">
          Slide to unveil <span aria-hidden="true">→</span>
        </label>
        <input
          id="hero-reveal"
          type="range"
          min="0"
          max="100"
          value={reveal}
          aria-label="Reveal featured product"
          aria-valuetext={`${reveal}% revealed`}
          onChange={(event) => setReveal(Number(event.target.value))}
        />
        <button
          type="button"
          onClick={() => setReveal(reveal === 100 ? 0 : 100)}
        >
          {reveal === 100 ? "Cover again" : "Reveal all"}
        </button>
      </div>
    </div>
  );
}

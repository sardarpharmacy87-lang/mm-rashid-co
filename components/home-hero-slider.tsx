"use client";

import { useEffect, useRef } from "react";
import { loadMotionRuntime } from "@/lib/motion-runtime";

export function HomeHeroSlider() {
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    let cancelled = false;

    loadMotionRuntime()
      .then((Motion) => {
        if (cancelled || !copyRef.current) return;

        const items = Array.from(copyRef.current.children);
        items.forEach((item) => {
          const element = item as HTMLElement;
          element.style.opacity = "0";
          element.style.transform = "translateY(28px)";
        });

        Motion.animate(
          items,
          {
            opacity: [0, 1],
            y: [28, 0],
          },
          {
            delay: Motion.stagger(0.09),
            duration: 0.85,
            ease: [0.22, 1, 0.36, 1],
          },
        );
      })
      .catch(() => {
        // CSS remains the fallback if the motion runtime is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="video-hero motion-hero" aria-label="MM Rashid craftsmanship">
      <video
        className="hero-background-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/workshop/stitching-video-poster.jpg"
        aria-hidden="true"
      >
        <source src="/videos/mm-rashid-hero.mp4" type="video/mp4" />
      </video>

      <div className="hero-video-overlay" />

      <div ref={copyRef} className="store-hero-copy">
        <p className="eyebrow light">
          <span />
          MM Rashid &amp; Co. · Sialkot · Since 1922
        </p>

        <h1 className="hero-video-heading">
          Symbols of distinction, <strong>made by hand.</strong>
        </h1>

        <p className="store-hero-intro">
          Goldwork, bullion embroidery, ceremonial badges and bespoke regalia
          crafted by skilled hands in Sialkot.
        </p>

        <div className="store-hero-actions">
          <a className="button button-gold" href="/sign-up">
            Start an enquiry <span aria-hidden="true">↗</span>
          </a>
          <a className="button button-outline-light" href="#gallery">
            Explore our work
          </a>
        </div>

        <div className="store-hero-features" aria-label="Key services">
          <span>Hand embroidery</span>
          <span>Custom commissions</span>
          <span>Worldwide enquiries</span>
        </div>
      </div>

      <a className="hero-video-scroll" href="#craft">
        <span>Discover the craft</span>
        <i aria-hidden="true" />
      </a>

      <style jsx>{`
        .hero-video-heading {
          margin: 0;
          max-width: 820px;
          color: #fff;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(3.8rem, 7vw, 7.4rem);
          font-weight: 500;
          letter-spacing: -0.06em;
          line-height: 0.9;
        }

        .hero-video-heading strong {
          color: var(--gold-500);
          font-weight: 500;
        }

        @media (max-width: 620px) {
          .hero-video-heading {
            font-size: clamp(3rem, 14vw, 4.6rem);
          }
        }
      `}</style>
    </section>
  );
}

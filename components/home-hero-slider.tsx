"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const slides = [
  {
    eyebrow: "Goldwork & Bullion",
    title: "Crafted in metal thread. Built by hand.",
    text: "Raised goldwork, purl and bullion embroidery shaped by skilled hands in Sialkot.",
    image: "/images/gallery/goldwork-leaf-detail.webp",
    position: "center",
  },
  {
    eyebrow: "Inside the Workshop",
    title: "Every stitch has a purpose.",
    text: "Traditional hand techniques bring depth, structure and character to every commission.",
    image: "/images/workshop/hand-stitching.jpeg",
    position: "center",
  },
  {
    eyebrow: "Military & Ceremonial",
    title: "Made to carry identity and tradition.",
    text: "Badges, banners, shoulder pieces and ceremonial details made to your brief.",
    image: "/images/gallery/ceremonial-embroidered-banner.webp",
    position: "center",
  },
  {
    eyebrow: "Our Heritage · Since 1922",
    title: "A century of specialist craftsmanship.",
    text: "A family tradition of embroidery and ceremonial work, continuing from Sialkot to customers worldwide.",
    image: "/images/heritage/mm-rashid-history.jpeg",
    position: "center",
  },
  {
    eyebrow: "Custom Commissions",
    title: "Your insignia. Our craftsmanship.",
    text: "Send the artwork, dimensions and finish. We develop the detail around your requirement.",
    image: "/images/gallery/gold-bullion-naval-badge.webp",
    position: "center",
  },
];

export function HomeHeroSlider() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const heroRef = useRef<HTMLElement>(null);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback((nextIndex: number, nextDirection: "next" | "prev") => {
    setDirection(nextDirection);
    setActive((nextIndex + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => {
    goTo(active + 1, "next");
  }, [active, goTo]);

  const previous = useCallback(() => {
    goTo(active - 1, "prev");
  }, [active, goTo]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      const hero = heroRef.current;
      if (!hero) return;

      const rect = hero.getBoundingClientRect();
      const heroIsActive = rect.top <= 100 && rect.bottom >= window.innerHeight * 0.55;
      if (!heroIsActive) return;

      if (event.code === "Space" || event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        next();
      }

      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        previous();
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, previous]);

  const onTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartY.current === null) return;

    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
    const distance = touchStartY.current - endY;
    touchStartY.current = null;

    if (Math.abs(distance) < 45) return;
    if (distance > 0) next();
    else previous();
  };

  return (
    <section
      ref={heroRef}
      className="story-hero"
      aria-label="MM Rashid craftsmanship story"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="story-hero-media" aria-hidden="true">
        {slides.map((slide, index) => (
          <div
            className={`story-image ${index === active ? "is-active" : ""}`}
            key={slide.image}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index < 2}
              sizes="100vw"
              style={{ objectPosition: slide.position }}
            />
          </div>
        ))}
      </div>

      <div className="story-overlay" />

      <div
        className={`story-copy story-copy-${direction}`}
        key={`${active}-${direction}`}
      >
        <p className="story-eyebrow">
          <span />
          {slides[active].eyebrow}
        </p>

        <h1>{slides[active].title}</h1>
        <p className="story-text">{slides[active].text}</p>

        <div className="story-actions">
          <a className="button story-primary" href="/sign-up">
            Start an enquiry <span aria-hidden="true">↗</span>
          </a>
          <a className="story-link" href="#gallery">
            Explore our work
          </a>
        </div>
      </div>

      <div className="story-progress" aria-label="Hero slides">
        <span className="story-count">
          {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>

        <div className="story-dots">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.eyebrow}
              className={index === active ? "is-active" : ""}
              onClick={() => goTo(index, index >= active ? "next" : "prev")}
              aria-label={`Show slide ${index + 1}: ${slide.eyebrow}`}
              aria-current={index === active ? "true" : undefined}
            />
          ))}
        </div>

        <div className="story-arrows">
          <button type="button" onClick={previous} aria-label="Previous hero slide">
            ↑
          </button>
          <button type="button" onClick={next} aria-label="Next hero slide">
            ↓
          </button>
        </div>
      </div>

      <div className="story-keyboard-cue" aria-hidden="true">
        <span className="desktop-cue">SPACE / ↓ NEXT&nbsp;&nbsp; · &nbsp;&nbsp;↑ BACK</span>
        <span className="mobile-cue">SWIPE TO EXPLORE</span>
      </div>

      <style jsx>{`
        .story-hero {
          position: relative;
          display: flex;
          min-height: 100svh;
          align-items: center;
          padding: 148px var(--page-padding) 104px;
          color: #fff;
          background: #020b1d;
          overflow: hidden;
          isolation: isolate;
        }

        .story-hero-media,
        .story-image,
        .story-overlay {
          position: absolute;
          inset: 0;
        }

        .story-hero-media {
          z-index: -3;
          background: #020b1d;
        }

        .story-image {
          opacity: 0;
          transform: scale(1.075) translate3d(0, 18px, 0);
          transition:
            opacity 850ms cubic-bezier(.22, 1, .36, 1),
            transform 1250ms cubic-bezier(.22, 1, .36, 1);
          will-change: opacity, transform;
        }

        .story-image :global(img) {
          object-fit: cover;
          filter: saturate(.9) contrast(1.04);
        }

        .story-image.is-active {
          opacity: 1;
          transform: scale(1) translate3d(0, 0, 0);
        }

        .story-overlay {
          z-index: -2;
          background:
            linear-gradient(
              90deg,
              rgba(2, 11, 29, .94) 0%,
              rgba(2, 11, 29, .79) 33%,
              rgba(2, 11, 29, .39) 67%,
              rgba(2, 11, 29, .22) 100%
            ),
            linear-gradient(
              to top,
              rgba(2, 11, 29, .72) 0%,
              transparent 48%
            );
          pointer-events: none;
        }

        .story-copy {
          position: relative;
          z-index: 2;
          width: min(780px, 76vw);
          animation: copyInNext 760ms cubic-bezier(.22, 1, .36, 1) both;
        }

        .story-copy-prev {
          animation-name: copyInPrev;
        }

        @keyframes copyInNext {
          from {
            opacity: 0;
            transform: translate3d(0, 34px, 0);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: blur(0);
          }
        }

        @keyframes copyInPrev {
          from {
            opacity: 0;
            transform: translate3d(0, -34px, 0);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: blur(0);
          }
        }

        .story-eyebrow {
          display: flex;
          align-items: center;
          gap: 13px;
          margin: 0 0 23px;
          color: var(--gold-400);
          font-size: .72rem;
          font-weight: 800;
          letter-spacing: .14em;
          line-height: 1.4;
          text-transform: uppercase;
        }

        .story-eyebrow span {
          display: block;
          width: 38px;
          height: 1px;
          background: currentColor;
        }

        .story-copy h1 {
          max-width: 780px;
          margin: 0;
          color: #fff;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(3.9rem, 7.2vw, 7.8rem);
          font-weight: 500;
          letter-spacing: -.06em;
          line-height: .9;
          text-wrap: balance;
        }

        .story-text {
          max-width: 590px;
          margin: 28px 0 0;
          color: rgba(255, 255, 255, .78);
          font-size: clamp(.98rem, 1.2vw, 1.08rem);
          line-height: 1.8;
        }

        .story-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 26px;
          margin-top: 34px;
        }

        .story-primary {
          color: #07152f;
          border-color: var(--gold-500);
          border-radius: 0;
          background: var(--gold-400);
        }

        .story-link {
          padding: 11px 1px 7px;
          color: #fff;
          border-bottom: 1px solid rgba(255, 255, 255, .72);
          font-size: .72rem;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .story-progress {
          position: absolute;
          z-index: 3;
          right: var(--page-padding);
          top: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          transform: translateY(-50%);
        }

        .story-count {
          color: rgba(255,255,255,.7);
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .14em;
        }

        .story-dots {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 9px;
        }

        .story-dots button {
          width: 2px;
          height: 28px;
          padding: 0;
          border: 0;
          cursor: pointer;
          background: rgba(255,255,255,.3);
          transition: height 220ms ease, background 220ms ease;
        }

        .story-dots button.is-active {
          height: 50px;
          background: var(--gold-400);
        }

        .story-arrows {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .story-arrows button {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          padding: 0;
          color: #fff;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,.3);
          border-radius: 50%;
          background: rgba(2,11,29,.28);
          backdrop-filter: blur(8px);
          transition: border-color 180ms ease, background 180ms ease;
        }

        .story-arrows button:hover {
          border-color: var(--gold-400);
          background: rgba(2,11,29,.55);
        }

        .story-keyboard-cue {
          position: absolute;
          z-index: 3;
          bottom: 28px;
          left: var(--page-padding);
          color: rgba(255,255,255,.58);
          font-size: .58rem;
          font-weight: 800;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .mobile-cue {
          display: none;
        }

        @media (max-width: 800px) {
          .story-hero {
            min-height: 100svh;
            align-items: flex-end;
            padding: 126px 22px 118px;
          }

          .story-overlay {
            background:
              linear-gradient(
                to top,
                rgba(2,11,29,.96) 0%,
                rgba(2,11,29,.68) 48%,
                rgba(2,11,29,.22) 100%
              ),
              linear-gradient(
                to right,
                rgba(2,11,29,.5),
                rgba(2,11,29,.08)
              );
          }

          .story-copy {
            width: calc(100% - 42px);
          }

          .story-copy h1 {
            font-size: clamp(3rem, 14vw, 5rem);
          }

          .story-text {
            margin-top: 20px;
            font-size: .94rem;
            line-height: 1.66;
          }

          .story-actions {
            gap: 18px;
            margin-top: 24px;
          }

          .story-progress {
            top: auto;
            right: 20px;
            bottom: 104px;
            transform: none;
          }

          .story-count,
          .story-dots {
            display: none;
          }

          .story-arrows {
            flex-direction: row;
          }

          .story-keyboard-cue {
            bottom: 29px;
            left: 22px;
          }

          .desktop-cue {
            display: none;
          }

          .mobile-cue {
            display: inline;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .story-image,
          .story-copy {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadMotionRuntime } from "@/lib/motion-runtime";

const slides = [
  {
    eyebrow: "MM Rashid & Co. · Sialkot · Since 1922",
    title: "Goldwork, shaped by hand.",
    body: "Bullion embroidery, ceremonial badges and bespoke insignia made in our Sialkot workshop.",
    image: "/images/gallery/goldwork-leaf-detail.webp",
    imageAlt: "Close detail of handmade gold bullion embroidery",
    tone: "blue",
  },
  {
    eyebrow: "Military & ceremonial",
    title: "Made for the occasion.",
    body: "Custom banners, shoulder pieces and ceremonial embroidery produced to your artwork and specification.",
    image: "/images/gallery/ceremonial-embroidered-banner.webp",
    imageAlt: "Handcrafted ceremonial embroidered banner",
    tone: "navy",
  },
  {
    eyebrow: "Regalia & custom work",
    title: "Your design. Our craft.",
    body: "Send your artwork, measurements and quantity. We review the brief and prepare a custom quotation.",
    image: "/images/gallery/custom-purple-fez-set.webp",
    imageAlt: "Custom purple embroidered fez set",
    tone: "indigo",
  },
];

export function HomeHeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);

  const paginate = useCallback((step: number) => {
    setActive((current) => (current + step + slides.length) % slides.length);
  }, []);

  const goTo = useCallback((index: number) => {
    setActive((index + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(() => {
      paginate(1);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [paused, paginate]);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) return;

    let cancelled = false;

    loadMotionRuntime()
      .then((Motion) => {
        if (cancelled) return;

        const copy = copyRef.current;
        const product = productRef.current;

        if (copy) {
          const items = Array.from(copy.children);
          items.forEach((item) => {
            const element = item as HTMLElement;
            element.style.opacity = "0";
            element.style.transform = "translateY(24px)";
          });

          Motion.animate(
            items,
            {
              opacity: [0, 1],
              y: [24, 0],
            },
            {
              delay: Motion.stagger(0.075),
              duration: 0.72,
              ease: [0.22, 1, 0.36, 1],
            },
          );
        }

        if (product) {
          Motion.animate(
            product,
            {
              opacity: [0, 1],
              scale: [0.9, 1],
              y: [34, 0],
              rotateZ: [-1.2, 0],
            },
            {
              type: "spring",
              stiffness: 105,
              damping: 19,
              mass: 0.85,
            },
          );
        }
      })
      .catch(() => {
        // CSS remains the fallback if the CDN is unavailable.
      });

    return () => {
      cancelled = true;
    };
  }, [active]);

  const slide = slides[active];

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const hero = heroRef.current;
    const product = productRef.current;

    if (reduceMotion || !hero || !product) return;

    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    loadMotionRuntime()
      .then((Motion) => {
        Motion.animate(
          product,
          {
            x: x * 18,
            y: y * 14,
            rotateX: y * -3.5,
            rotateY: x * 4.5,
          },
          {
            type: "spring",
            stiffness: 180,
            damping: 22,
            mass: 0.55,
          },
        );
      })
      .catch(() => {});
  }

  function resetProduct() {
    const product = productRef.current;
    if (!product) return;

    loadMotionRuntime()
      .then((Motion) => {
        Motion.animate(
          product,
          {
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
          },
          {
            type: "spring",
            stiffness: 160,
            damping: 20,
          },
        );
      })
      .catch(() => {});
  }

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    pointerStart.current = event.clientX;
  }

  function handlePointerUp(event: React.PointerEvent<HTMLElement>) {
    if (pointerStart.current === null) return;

    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;

    if (distance < -70) paginate(1);
    if (distance > 70) paginate(-1);
  }

  return (
    <section
      ref={heroRef}
      className="samsung-hero motion-hero"
      aria-label="MM Rashid featured work"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => {
        setPaused(false);
        resetProduct();
      }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div className="samsung-hero-track">
        <article
          className={`samsung-hero-slide samsung-hero-${slide.tone}`}
          key={slide.title}
        >
          <div ref={copyRef} className="samsung-hero-copy">
            <p>{slide.eyebrow}</p>
            <h1>{slide.title}</h1>
            <span>{slide.body}</span>

            <div className="samsung-hero-actions">
              <a className="samsung-text-action" href="#gallery">
                View work
              </a>
              <a className="samsung-primary-action" href="/sign-up">
                Send enquiry
              </a>
            </div>
          </div>

          <div ref={productRef} className="samsung-hero-product motion-depth">
            <Image
              src={slide.image}
              alt={slide.imageAlt}
              fill
              priority={active === 0}
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </div>
        </article>
      </div>

      <div className="samsung-hero-controls" aria-label="Hero slides">
        <button
          type="button"
          className="samsung-arrow"
          onClick={() => paginate(-1)}
          aria-label="Previous slide"
        >
          ←
        </button>

        <div className="samsung-dots">
          {slides.map((item, index) => (
            <button
              type="button"
              className={index === active ? "is-active" : ""}
              aria-label={`Show ${item.title}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => goTo(index)}
              key={item.title}
            />
          ))}
        </div>

        <button
          type="button"
          className="samsung-arrow"
          onClick={() => paginate(1)}
          aria-label="Next slide"
        >
          →
        </button>
      </div>
    </section>
  );
}

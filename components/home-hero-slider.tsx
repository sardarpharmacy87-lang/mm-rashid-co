"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (paused) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [paused]);

  function goTo(index: number) {
    setActive((index + slides.length) % slides.length);
  }

  return (
    <section
      className="samsung-hero"
      aria-label="MM Rashid featured work"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className="samsung-hero-track"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <article
            className={`samsung-hero-slide samsung-hero-${slide.tone}`}
            aria-hidden={active !== index}
            key={slide.title}
          >
            <div className="samsung-hero-copy">
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

            <div className="samsung-hero-product">
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                priority={index === 0}
                sizes="(max-width: 900px) 100vw, 58vw"
              />
            </div>
          </article>
        ))}
      </div>

      <div className="samsung-hero-controls" aria-label="Hero slides">
        <button
          type="button"
          className="samsung-arrow"
          onClick={() => goTo(active - 1)}
          aria-label="Previous slide"
        >
          ←
        </button>

        <div className="samsung-dots">
          {slides.map((slide, index) => (
            <button
              type="button"
              className={index === active ? "is-active" : ""}
              aria-label={`Show ${slide.title}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => goTo(index)}
              key={slide.title}
            />
          ))}
        </div>

        <button
          type="button"
          className="samsung-arrow"
          onClick={() => goTo(active + 1)}
          aria-label="Next slide"
        >
          →
        </button>
      </div>
    </section>
  );
}

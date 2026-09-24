"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./regalia-showcase-slider.module.css";

const slides = [
  {
    kicker: "Fraternal Regalia",
    title: "Ceremonial aprons made with precise hand detail.",
    text: "Custom velvet, metallic embroidery, fringe and emblem work developed around your lodge or ceremonial brief.",
    image: "/images/showcase/fraternal-apron.webp",
    alt: "Handcrafted ceremonial apron with gold embroidery and fringe",
  },
  {
    kicker: "Custom Headwear",
    title: "Fez and ceremonial headwear finished by hand.",
    text: "Detailed bullion, stones, lettering and insignia can be developed to match your required colours and identity.",
    image: "/images/gallery/custom-maroon-fez.webp",
    alt: "Custom maroon ceremonial fez with hand embroidery",
  },
  {
    kicker: "Ceremonial Banners",
    title: "Statement pieces built for tradition and presentation.",
    text: "Banners and presentation pieces combine precise embroidery, metallic trims, tassels and custom insignia.",
    image: "/images/gallery/ceremonial-embroidered-banner.webp",
    alt: "Hand embroidered ceremonial banner",
  },
  {
    kicker: "Caps & Visors",
    title: "Specialist bullion work for formal headwear.",
    text: "Structured caps, peaks and visors are finished with raised metallic embroidery and careful hand detailing.",
    image: "/images/gallery/silver-bullion-cap-visor.webp",
    alt: "Silver bullion ceremonial cap visor",
  },
];

export function RegaliaShowcaseSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, [paused]);

  const show = (index: number) => {
    setActive((index + slides.length) % slides.length);
  };

  return (
    <section
      className={styles.section}
      aria-label="MM Rashid & Co. regalia showcase"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className={styles.topline}>
        <span>MM RASHID &amp; CO.</span>
        <span>HANDCRAFTED IN SIALKOT · SINCE 1922</span>
      </div>

      <div className={styles.frame}>
        <div className={styles.copy}>
          <p className={styles.kicker}>{slides[active].kicker}</p>
          <h2 key={`title-${active}`}>{slides[active].title}</h2>
          <p className={styles.text}>{slides[active].text}</p>

          <div className={styles.actions}>
            <a className={styles.primary} href="/sign-up">
              Request custom work <span aria-hidden="true">↗</span>
            </a>
            <a className={styles.secondary} href="#collections">
              Explore collection
            </a>
          </div>

          <div className={styles.controls}>
            <button type="button" onClick={() => show(active - 1)} aria-label="Previous product">
              ←
            </button>

            <div className={styles.dots} aria-label="Showcase slides">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  key={slide.kicker}
                  className={index === active ? styles.activeDot : ""}
                  onClick={() => show(index)}
                  aria-label={`Show ${slide.kicker}`}
                  aria-current={index === active ? "true" : undefined}
                />
              ))}
            </div>

            <button type="button" onClick={() => show(active + 1)} aria-label="Next product">
              →
            </button>
          </div>
        </div>

        <div className={styles.visual} aria-live="polite">
          <div className={styles.halo} />
          {slides.map((slide, index) => (
            <div
              className={`${styles.product} ${index === active ? styles.activeProduct : ""}`}
              key={slide.image}
              aria-hidden={index !== active}
            >
              <Image
                src={slide.image}
                alt={index === active ? slide.alt : ""}
                fill
                sizes="(max-width: 820px) 88vw, 48vw"
                priority={index === 0}
              />
            </div>
          ))}
          <span className={styles.number}>
            {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}

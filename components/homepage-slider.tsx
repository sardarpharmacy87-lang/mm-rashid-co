"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type HomepageSlide = {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  delay_ms: number;
};

export function HomepageSlider({ slides }: { slides: HomepageSlide[] }) {
  const [active, setActive] = useState(0);
  const pointerStart = useRef<number | null>(null);

  const show = useCallback(
    (index: number) => {
      if (!slides.length) return;
      setActive((index + slides.length) % slides.length);
    },
    [slides.length],
  );

  const next = useCallback(() => show(active + 1), [active, show]);
  const previous = useCallback(() => show(active - 1), [active, show]);

  useEffect(() => {
    if (slides.length < 2) return;
    const delay = Math.max(2000, slides[active]?.delay_ms || 5000);
    const timer = window.setTimeout(next, delay);
    return () => window.clearTimeout(timer);
  }, [active, next, slides]);

  useEffect(() => {
    if (active >= slides.length && slides.length) setActive(0);
  }, [active, slides.length]);

  if (!slides.length) return null;

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    pointerStart.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (pointerStart.current === null) return;
    const distance = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(distance) < 45) return;
    if (distance < 0) next();
    else previous();
  };

  return (
    <section
      className="homepage-slider"
      aria-label="Featured MM Rashid & Co. work"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { pointerStart.current = null; }}
    >
      <div className="homepage-slider-track">
        {slides.map((slide, index) => (
          <div
            className={"homepage-slider-slide " + (index === active ? "is-active" : "")}
            aria-hidden={index !== active}
            key={slide.id}
          >
            <img
              src={slide.image_url}
              alt={index === active ? slide.alt_text || "MM Rashid & Co. featured work" : ""}
              loading={index === 0 ? "eager" : "lazy"}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <button className="homepage-slider-arrow prev" type="button" onClick={previous} aria-label="Previous slide">←</button>
          <button className="homepage-slider-arrow next" type="button" onClick={next} aria-label="Next slide">→</button>

          <div className="homepage-slider-dots" aria-label="Choose slide">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={slide.id}
                className={index === active ? "is-active" : ""}
                aria-label={"Show slide " + (index + 1)}
                aria-current={index === active ? "true" : undefined}
                onClick={() => show(index)}
              />
            ))}
          </div>
        </>
      ) : null}

      <span className="homepage-slider-counter">
        {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </span>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "8%" : "-8%",
    opacity: 0,
    scale: 0.985,
  }),
  center: {
    x: "0%",
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-5%" : "5%",
    opacity: 0,
    scale: 1.01,
  }),
};

const copyVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.075,
      delayChildren: 0.12,
    },
  },
};

const copyItemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 155,
      damping: 22,
      mass: 0.8,
    },
  },
};

export function HomeHeroSlider() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const paginate = useCallback((step: number) => {
    setDirection(step >= 0 ? 1 : -1);
    setActive((current) => (current + step + slides.length) % slides.length);
  }, []);

  const goTo = useCallback((index: number) => {
    setDirection(index >= active ? 1 : -1);
    setActive((index + slides.length) % slides.length);
  }, [active]);

  useEffect(() => {
    if (paused || reduceMotion) return;

    const timer = window.setInterval(() => {
      paginate(1);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, paginate]);

  const slide = slides[active];

  return (
    <section
      className="samsung-hero motion-hero"
      aria-label="MM Rashid featured work"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="motion-hero-stage">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.article
            className={`samsung-hero-slide samsung-hero-${slide.tone}`}
            key={slide.title}
            custom={direction}
            variants={slideVariants}
            initial={reduceMotion ? false : "enter"}
            animate="center"
            exit={reduceMotion ? undefined : "exit"}
            transition={{
              x: { type: "spring", stiffness: 115, damping: 24, mass: 0.9 },
              opacity: { duration: 0.38 },
              scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
            }}
            drag={reduceMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={(_, info) => {
              const swipe = Math.abs(info.offset.x) * info.velocity.x;
              if (swipe < -6500 || info.offset.x < -85) paginate(1);
              if (swipe > 6500 || info.offset.x > 85) paginate(-1);
            }}
          >
            <motion.div
              className="samsung-hero-copy"
              variants={copyVariants}
              initial={reduceMotion ? false : "hidden"}
              animate="show"
            >
              <motion.p variants={copyItemVariants}>{slide.eyebrow}</motion.p>
              <motion.h1 variants={copyItemVariants}>{slide.title}</motion.h1>
              <motion.span variants={copyItemVariants}>{slide.body}</motion.span>

              <motion.div
                className="samsung-hero-actions"
                variants={copyItemVariants}
              >
                <motion.a
                  className="samsung-text-action"
                  href="#gallery"
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                >
                  View work
                </motion.a>

                <motion.a
                  className="samsung-primary-action"
                  href="/sign-up"
                  whileHover={reduceMotion ? undefined : { y: -3, scale: 1.025 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 360, damping: 24 }}
                >
                  Send enquiry
                </motion.a>
              </motion.div>
            </motion.div>

            <motion.div
              className="samsung-hero-product"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 95,
                damping: 20,
                mass: 1,
                delay: reduceMotion ? 0 : 0.08,
              }}
            >
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                fill
                priority={active === 0}
                sizes="(max-width: 900px) 100vw, 58vw"
              />
            </motion.div>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="samsung-hero-controls" aria-label="Hero slides">
        <motion.button
          type="button"
          className="samsung-arrow"
          onClick={() => paginate(-1)}
          aria-label="Previous slide"
          whileTap={reduceMotion ? undefined : { scale: 0.9 }}
        >
          ←
        </motion.button>

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

        <motion.button
          type="button"
          className="samsung-arrow"
          onClick={() => paginate(1)}
          aria-label="Next slide"
          whileTap={reduceMotion ? undefined : { scale: 0.9 }}
        >
          →
        </motion.button>
      </div>
    </section>
  );
}

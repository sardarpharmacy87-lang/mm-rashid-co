"use client";

import { useEffect } from "react";

export function RevealController() {
  useEffect(() => {
    const root = document.documentElement;
    const elements = document.querySelectorAll<HTMLElement>(".reveal");
    const hero = document.querySelector<HTMLElement>(".hero");
    const heritageImage = document.querySelector<HTMLElement>(".heritage-image");
    const workshopVideo = document.querySelector<HTMLElement>(".workshop-video");
    const contactGlow = document.querySelector<HTMLElement>(".contact-glow");
    const magneticItems = Array.from(
      document.querySelectorAll<HTMLElement>(".button-gold, .header-enquiry"),
    );
    const tiltItems = Array.from(
      document.querySelectorAll<HTMLElement>(".gallery-card, .craft-card"),
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    root.classList.add("motion-ready");

    if (!("IntersectionObserver" in window) || reduceMotion) {
      elements.forEach((element) => element.classList.add("is-visible"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -48px 0px",
        },
      );

      elements.forEach((element) => {
        if (element.getBoundingClientRect().top >= window.innerHeight * 0.82) {
          element.classList.add("reveal-pending");
        }
        observer.observe(element);
      });

      let frame = 0;

      const updateScrollMotion = () => {
        frame = 0;
        const viewportHeight = window.innerHeight;
        const maxScroll = Math.max(
          1,
          document.documentElement.scrollHeight - viewportHeight,
        );
        const pageProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));

        root.style.setProperty("--page-progress", pageProgress.toString());

        if (heritageImage) {
          const rect = heritageImage.getBoundingClientRect();
          const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
          const offset = Math.max(-18, Math.min(18, (progress - 0.5) * 36));
          heritageImage.style.setProperty("--section-parallax", `${offset}px`);
        }

        if (workshopVideo) {
          const rect = workshopVideo.getBoundingClientRect();
          const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
          const offset = Math.max(-14, Math.min(14, (progress - 0.5) * -28));
          workshopVideo.style.setProperty("--section-parallax", `${offset}px`);
        }

        if (contactGlow) {
          const rect = contactGlow.getBoundingClientRect();
          const offset = Math.max(
            -35,
            Math.min(35, (viewportHeight - rect.top) * 0.035),
          );
          contactGlow.style.setProperty("--glow-shift", `${offset}px`);
        }
      };

      const onScroll = () => {
        if (frame) return;
        frame = window.requestAnimationFrame(updateScrollMotion);
      };

      const onHeroMove = (event: PointerEvent) => {
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        hero.style.setProperty("--hero-pointer-x", `${x * 18}px`);
        hero.style.setProperty("--hero-pointer-y", `${y * 14}px`);
      };

      const resetHero = () => {
        hero?.style.setProperty("--hero-pointer-x", "0px");
        hero?.style.setProperty("--hero-pointer-y", "0px");
      };

      const magneticHandlers = magneticItems.map((item) => {
        const move = (event: PointerEvent) => {
          const rect = item.getBoundingClientRect();
          const x = event.clientX - (rect.left + rect.width / 2);
          const y = event.clientY - (rect.top + rect.height / 2);
          item.style.setProperty("--magnetic-x", `${x * 0.12}px`);
          item.style.setProperty("--magnetic-y", `${y * 0.12}px`);
        };

        const leave = () => {
          item.style.setProperty("--magnetic-x", "0px");
          item.style.setProperty("--magnetic-y", "0px");
        };

        item.addEventListener("pointermove", move);
        item.addEventListener("pointerleave", leave);

        return { item, move, leave };
      });

      const tiltHandlers = finePointer
        ? tiltItems.map((item) => {
            const move = (event: PointerEvent) => {
              const rect = item.getBoundingClientRect();
              const x = (event.clientX - rect.left) / rect.width - 0.5;
              const y = (event.clientY - rect.top) / rect.height - 0.5;
              item.style.setProperty("--tilt-x", `${x * 5}deg`);
              item.style.setProperty("--tilt-y", `${y * -5}deg`);
            };

            const leave = () => {
              item.style.setProperty("--tilt-x", "0deg");
              item.style.setProperty("--tilt-y", "0deg");
            };

            item.addEventListener("pointermove", move);
            item.addEventListener("pointerleave", leave);

            return { item, move, leave };
          })
        : [];

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      hero?.addEventListener("pointermove", onHeroMove);
      hero?.addEventListener("pointerleave", resetHero);
      updateScrollMotion();

      return () => {
        observer.disconnect();
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        hero?.removeEventListener("pointermove", onHeroMove);
        hero?.removeEventListener("pointerleave", resetHero);

        magneticHandlers.forEach(({ item, move, leave }) => {
          item.removeEventListener("pointermove", move);
          item.removeEventListener("pointerleave", leave);
        });

        tiltHandlers.forEach(({ item, move, leave }) => {
          item.removeEventListener("pointermove", move);
          item.removeEventListener("pointerleave", leave);
        });

        if (frame) window.cancelAnimationFrame(frame);
        elements.forEach((element) => element.classList.remove("reveal-pending"));
        root.classList.remove("motion-ready");
      };
    }

    return () => {
      elements.forEach((element) => element.classList.remove("reveal-pending"));
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}

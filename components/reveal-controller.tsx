"use client";

import { useEffect } from "react";
import { loadMotionRuntime } from "@/lib/motion-runtime";

export function RevealController() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    root.classList.add("motion-ready");

    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal"),
    );

    if (reduceMotion) {
      revealElements.forEach((element) => {
        element.classList.add("is-visible");
        element.style.opacity = "1";
        element.style.transform = "none";
        element.style.filter = "none";
      });

      return () => {
        root.classList.remove("motion-ready");
      };
    }

    let disposed = false;
    const cleanups: Array<() => void> = [];

    loadMotionRuntime()
      .then((Motion) => {
        if (disposed) return;

        revealElements.forEach((element) => {
          element.style.opacity = "0";
          element.style.transform = "translateY(28px)";
          element.style.filter = "blur(3px)";
        });

        const stopReveal = Motion.inView(
          revealElements,
          (element) => {
            const htmlElement = element as HTMLElement;
            htmlElement.classList.add("is-visible");

            Motion.animate(
              htmlElement,
              {
                opacity: [0, 1],
                y: [28, 0],
                filter: ["blur(3px)", "blur(0px)"],
              },
              {
                type: "spring",
                stiffness: 110,
                damping: 21,
                mass: 0.75,
              },
            );
          },
          {
            amount: 0.14,
            margin: "0px 0px -8% 0px",
          },
        );

        cleanups.push(stopReveal);

        cleanups.push(
          Motion.scroll((progress: number) => {
            root.style.setProperty("--page-progress", progress.toString());
          }),
        );

        const parallaxTargets = [
          {
            element: document.querySelector<HTMLElement>(".heritage-store-image"),
            from: "-18px",
            to: "18px",
          },
          {
            element: document.querySelector<HTMLElement>(".workshop-store-video"),
            from: "16px",
            to: "-16px",
          },
          {
            element: document.querySelector<HTMLElement>(".collection-promo-image"),
            from: "-12px",
            to: "12px",
          },
        ];

        parallaxTargets.forEach(({ element, from, to }) => {
          if (!element) return;

          const animation = Motion.animate(
            element,
            {
              y: [from, to],
            },
            {
              ease: "linear",
            },
          );

          cleanups.push(
            Motion.scroll(animation, {
              target: element,
              offset: ["start end", "end start"],
            }),
          );
        });

        const rails = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".category-grid, .product-grid, .collection-grid, .reason-grid",
          ),
        );

        rails.forEach((rail) => {
          const cards = Array.from(
            rail.querySelectorAll<HTMLElement>(
              ".category-tile, .product-card, .collection-card, .reason-card",
            ),
          );

          cards.forEach((card) => {
            card.style.opacity = "0";
            card.style.transform = "translateY(22px) scale(0.985)";
          });

          cleanups.push(
            Motion.inView(
              rail,
              () => {
                Motion.animate(
                  cards,
                  {
                    opacity: [0, 1],
                    y: [22, 0],
                    scale: [0.985, 1],
                  },
                  {
                    delay: Motion.stagger(0.07),
                    type: "spring",
                    stiffness: 105,
                    damping: 20,
                    mass: 0.7,
                  },
                );
              },
              {
                amount: 0.12,
              },
            ),
          );
        });

        const magneticItems = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".samsung-primary-action, .header-enquiry, .button-gold",
          ),
        );

        const magneticCleanup = magneticItems.map((item) => {
          const move = (event: PointerEvent) => {
            const rect = item.getBoundingClientRect();
            const x = event.clientX - (rect.left + rect.width / 2);
            const y = event.clientY - (rect.top + rect.height / 2);

            Motion.animate(
              item,
              {
                x: x * 0.1,
                y: y * 0.1,
              },
              {
                type: "spring",
                stiffness: 260,
                damping: 24,
                mass: 0.45,
              },
            );
          };

          const leave = () => {
            Motion.animate(
              item,
              {
                x: 0,
                y: 0,
              },
              {
                type: "spring",
                stiffness: 220,
                damping: 22,
              },
            );
          };

          item.addEventListener("pointermove", move);
          item.addEventListener("pointerleave", leave);

          return () => {
            item.removeEventListener("pointermove", move);
            item.removeEventListener("pointerleave", leave);
          };
        });

        cleanups.push(...magneticCleanup);

        const hoverCards = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".product-card, .collection-card, .category-tile",
          ),
        );

        const hoverCleanup = hoverCards.map((card) => {
          const image = card.querySelector<HTMLElement>("img");

          const enter = () => {
            Motion.animate(
              card,
              {
                y: -6,
              },
              {
                type: "spring",
                stiffness: 210,
                damping: 22,
              },
            );

            if (image) {
              Motion.animate(
                image,
                {
                  scale: 1.045,
                },
                {
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                },
              );
            }
          };

          const leave = () => {
            Motion.animate(
              card,
              {
                y: 0,
              },
              {
                type: "spring",
                stiffness: 190,
                damping: 22,
              },
            );

            if (image) {
              Motion.animate(
                image,
                {
                  scale: 1,
                },
                {
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                },
              );
            }
          };

          card.addEventListener("pointerenter", enter);
          card.addEventListener("pointerleave", leave);

          return () => {
            card.removeEventListener("pointerenter", enter);
            card.removeEventListener("pointerleave", leave);
          };
        });

        cleanups.push(...hoverCleanup);
      })
      .catch(() => {
        revealElements.forEach((element) => {
          element.classList.add("is-visible");
          element.style.opacity = "1";
          element.style.transform = "none";
          element.style.filter = "none";
        });
      });

    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
      root.classList.remove("motion-ready");
      root.style.removeProperty("--page-progress");
    };
  }, []);

  return null;
}

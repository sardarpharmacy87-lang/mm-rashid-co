"use client";

import { useEffect } from "react";
import { loadMotionRuntime } from "@/lib/motion-runtime";

export function RevealController() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    root.classList.add("motion-ready");

    if (reduceMotion) {
      revealElements.forEach((element) => {
        element.classList.add("is-visible");
        element.style.opacity = "1";
        element.style.transform = "none";
        element.style.filter = "none";
      });
      return () => root.classList.remove("motion-ready");
    }

    let disposed = false;
    const cleanups: Array<() => void> = [];

    loadMotionRuntime()
      .then((Motion) => {
        if (disposed) return;

        revealElements.forEach((element) => {
          element.style.opacity = "0";
          element.style.transform = "translateY(34px)";
          element.style.filter = "blur(5px)";
        });

        cleanups.push(
          Motion.inView(
            revealElements,
            (element) => {
              const node = element as HTMLElement;
              node.classList.add("is-visible");
              Motion.animate(
                node,
                {
                  opacity: [0, 1],
                  y: [34, 0],
                  filter: ["blur(5px)", "blur(0px)"],
                },
                {
                  type: "spring",
                  stiffness: 95,
                  damping: 20,
                  mass: 0.82,
                },
              );
            },
            { amount: 0.12, margin: "0px 0px -8% 0px" },
          ),
        );

        cleanups.push(
          Motion.scroll((progress: number) => {
            root.style.setProperty("--page-progress", progress.toString());
          }),
        );

        const parallaxTargets = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".bloom-hero-mark, .bloom-heritage-media, .bloom-workshop-frame",
          ),
        );

        parallaxTargets.forEach((element, index) => {
          const animation = Motion.animate(
            element,
            { y: index === 0 ? ["-10px", "18px"] : ["14px", "-14px"] },
            { ease: "linear" },
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
            ".bloom-group-grid, .store-product-grid, .bloom-process-list, .bloom-trust-rail",
          ),
        );

        rails.forEach((rail) => {
          const cards = Array.from(rail.children).filter(
            (node): node is HTMLElement => node instanceof HTMLElement,
          );

          cards.forEach((card) => {
            card.style.opacity = "0";
            card.style.transform = "translateY(24px)";
          });

          cleanups.push(
            Motion.inView(
              rail,
              () => {
                Motion.animate(
                  cards,
                  { opacity: [0, 1], y: [24, 0] },
                  {
                    delay: Motion.stagger(0.07),
                    type: "spring",
                    stiffness: 105,
                    damping: 21,
                    mass: 0.74,
                  },
                );
              },
              { amount: 0.08 },
            ),
          );
        });


        const hero = document.querySelector<HTMLElement>(".bloom-hero");
        const emblemStage = document.querySelector<HTMLElement>(".bloom-emblem-stage");

        if (hero && emblemStage && window.matchMedia("(pointer: fine)").matches) {
          const tilt = (event: PointerEvent) => {
            const rect = hero.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            Motion.animate(
              emblemStage,
              {
                rotateX: y * -4.5,
                rotateY: x * 5.5,
                x: x * 8,
                y: y * 6,
              },
              {
                type: "spring",
                stiffness: 115,
                damping: 19,
                mass: 0.62,
              },
            );
          };

          const resetTilt = () => {
            Motion.animate(
              emblemStage,
              { rotateX: 0, rotateY: 0, x: 0, y: 0 },
              { type: "spring", stiffness: 120, damping: 20 },
            );
          };

          hero.addEventListener("pointermove", tilt);
          hero.addEventListener("pointerleave", resetTilt);
          cleanups.push(() => {
            hero.removeEventListener("pointermove", tilt);
            hero.removeEventListener("pointerleave", resetTilt);
          });
        }

        const heritageTitle = document.querySelector<HTMLElement>(".heritage-motion-title");
        if (heritageTitle) {
          const lines = Array.from(
            heritageTitle.querySelectorAll<HTMLElement>(".motion-line"),
          );

          lines.forEach((line) => {
            line.style.opacity = "0";
            line.style.transform = "translateY(38px)";
            line.style.filter = "blur(4px)";
          });

          cleanups.push(
            Motion.inView(
              heritageTitle,
              () => {
                Motion.animate(
                  lines,
                  {
                    opacity: [0, 1],
                    y: [38, 0],
                    filter: ["blur(4px)", "blur(0px)"],
                  },
                  {
                    delay: Motion.stagger(0.13),
                    duration: 0.78,
                    ease: [0.22, 1, 0.36, 1],
                  },
                );
              },
              { amount: 0.35 },
            ),
          );
        }

        const processList = document.querySelector<HTMLElement>(".bloom-process-list");
        if (processList) {
          cleanups.push(
            Motion.scroll(
              (progress: number) => {
                processList.style.setProperty("--process-progress", progress.toString());
              },
              {
                target: processList,
                offset: ["start 78%", "end 38%"],
              },
            ),
          );
        }

        const magneticItems = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".store-primary-button, .bloom-quote, .bloom-group-card",
          ),
        );

        magneticItems.forEach((item) => {
          const move = (event: PointerEvent) => {
            const rect = item.getBoundingClientRect();
            const x = event.clientX - (rect.left + rect.width / 2);
            const y = event.clientY - (rect.top + rect.height / 2);
            Motion.animate(
              item,
              { x: x * 0.055, y: y * 0.055 },
              { type: "spring", stiffness: 250, damping: 24, mass: 0.45 },
            );
          };

          const leave = () => {
            Motion.animate(
              item,
              { x: 0, y: 0 },
              { type: "spring", stiffness: 220, damping: 22 },
            );
          };

          item.addEventListener("pointermove", move);
          item.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            item.removeEventListener("pointermove", move);
            item.removeEventListener("pointerleave", leave);
          });
        });
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

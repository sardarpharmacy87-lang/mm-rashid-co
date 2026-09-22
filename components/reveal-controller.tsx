"use client";

import { useEffect } from "react";
import { animate, inView, scroll } from "motion";

export function RevealController() {
  useEffect(() => {
    const root = document.documentElement;
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal"),
    );
    const heritageImage = document.querySelector<HTMLElement>(".heritage-store-image");
    const workshopVideo = document.querySelector<HTMLElement>(".workshop-store-video");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.classList.add("motion-ready");

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

    const cleanups: Array<() => void> = [];

    const stopReveal = inView(
      revealElements,
      (element) => {
        element.classList.add("is-visible");

        animate(
          element,
          {
            opacity: [0, 1],
            y: [28, 0],
            filter: ["blur(3px)", "blur(0px)"],
          },
          {
            type: "spring",
            stiffness: 105,
            damping: 20,
            mass: 0.8,
          },
        );
      },
      {
        amount: 0.14,
        margin: "0px 0px -8% 0px",
      },
    );

    cleanups.push(stopReveal);

    const stopProgress = scroll((progress) => {
      root.style.setProperty("--page-progress", progress.toString());
    });

    cleanups.push(stopProgress);

    if (heritageImage) {
      const heritageMotion = animate(
        heritageImage,
        {
          y: ["-18px", "18px"],
        },
        {
          ease: "linear",
        },
      );

      cleanups.push(
        scroll(heritageMotion, {
          target: heritageImage,
          offset: ["start end", "end start"],
        }),
      );
    }

    if (workshopVideo) {
      const workshopMotion = animate(
        workshopVideo,
        {
          y: ["14px", "-14px"],
        },
        {
          ease: "linear",
        },
      );

      cleanups.push(
        scroll(workshopMotion, {
          target: workshopVideo,
          offset: ["start end", "end start"],
        }),
      );
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      root.classList.remove("motion-ready");
      root.style.removeProperty("--page-progress");
    };
  }, []);

  return null;
}

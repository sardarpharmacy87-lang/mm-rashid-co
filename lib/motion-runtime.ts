"use client";

type MotionControls = {
  stop?: () => void;
};

export type MotionRuntime = {
  animate: (
    target: unknown,
    keyframes: Record<string, unknown>,
    options?: Record<string, unknown>,
  ) => MotionControls & PromiseLike<unknown>;
  inView: (
    target: string | Element | Element[],
    onStart: (element: Element) => void | (() => void),
    options?: Record<string, unknown>,
  ) => () => void;
  scroll: (
    animationOrCallback: unknown,
    options?: Record<string, unknown>,
  ) => () => void;
  stagger: (duration: number, options?: Record<string, unknown>) => unknown;
};

declare global {
  interface Window {
    Motion?: MotionRuntime;
  }
}

let runtimePromise: Promise<MotionRuntime> | null = null;

export function loadMotionRuntime(): Promise<MotionRuntime> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Motion runtime requires the browser."));
  }

  if (window.Motion) {
    return Promise.resolve(window.Motion);
  }

  if (runtimePromise) {
    return runtimePromise;
  }

  runtimePromise = new Promise<MotionRuntime>((resolve, reject) => {
    const finish = () => {
      if (window.Motion) {
        resolve(window.Motion);
      } else {
        runtimePromise = null;
        reject(new Error("Motion runtime loaded without a global Motion object."));
      }
    };

    const existing = document.getElementById(
      "mmr-motion-runtime",
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.Motion) {
        resolve(window.Motion);
        return;
      }

      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener(
        "error",
        () => {
          runtimePromise = null;
          reject(new Error("Could not load Motion runtime."));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "mmr-motion-runtime";
    script.src =
      "https://cdn.jsdelivr.net/npm/motion@13.4.0/dist/motion.js";
    script.async = true;
    script.addEventListener("load", finish, { once: true });
    script.addEventListener(
      "error",
      () => {
        runtimePromise = null;
        reject(new Error("Could not load Motion runtime."));
      },
      { once: true },
    );

    document.head.appendChild(script);
  });

  return runtimePromise;
}

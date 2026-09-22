"use client";

import Image from "next/image";
import { useRef } from "react";

export function InteractiveEmblem() {
  const emblemRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(
    event: React.PointerEvent<HTMLDivElement>
  ) {
    const emblem = emblemRef.current;

    if (!emblem || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const bounds = emblem.getBoundingClientRect();

    const horizontal =
      (event.clientX - bounds.left) / bounds.width;

    const vertical =
      (event.clientY - bounds.top) / bounds.height;

    const rotateY = (horizontal - 0.5) * 16;
    const rotateX = (vertical - 0.5) * -16;

    emblem.style.transform = `
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.025)
    `;
  }

  function handlePointerLeave() {
    const emblem = emblemRef.current;

    if (!emblem) {
      return;
    }

    emblem.style.transform =
      "rotateX(0deg) rotateY(0deg) scale(1)";
  }

  return (
    <div
      className="interactive-emblem reveal delay-one"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="emblem-glow" aria-hidden="true" />

      <div ref={emblemRef} className="emblem-image">
        <Image
          src="/mm-rashid-logo.png"
          alt="MM Rashid and Company official emblem"
          width={720}
          height={720}
          priority
          draggable={false}
          sizes="(max-width: 900px) 82vw, 45vw"
        />
      </div>
    </div>
  );
}

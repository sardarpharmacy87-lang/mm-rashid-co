"use client";

// Short workshop sequence

import { useCallback, useEffect, useRef, useState } from "react";

type WorkshopReel = {
  src: string;
  label: string;
  title: string;
  poster?: string;
  maxSeconds?: number;
};

const reels: WorkshopReel[] = [
  {
    src: "/videos/stitching/stitching-process.mp4",
    poster: "/images/workshop/stitching-video-poster.jpg",
    label: "Hand embroidery",
    title: "Original stitching process",
    maxSeconds: 8,
  },
  {
    src: "/videos/stitching/reel-02.mp4",
    label: "Artwork & detail",
    title: "Preparing the design",
  },
  {
    src: "/videos/stitching/reel-03.mp4",
    label: "Cap handwork",
    title: "Workshop stitching",
  },
  {
    src: "/videos/stitching/reel-04.mp4",
    label: "Finished embroidery",
    title: "Detail on the finished piece",
  },
  {
    src: "/videos/stitching/reel-05.mp4",
    label: "Workshop preparation",
    title: "Building the piece by hand",
  },
  {
    src: "/videos/stitching/reel-06.mp4",
    label: "Needlework detail",
    title: "Close-up hand stitching",
  },
];

export function WorkshopReels() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pointerStart = useRef<number | null>(null);
  const current = reels[active];

  const show = useCallback((index: number) => {
    setActive((index + reels.length) % reels.length);
    setPlaying(true);
  }, []);

  const next = useCallback(() => show(active + 1), [active, show]);
  const previous = useCallback(() => show(active - 1), [active, show]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    const promise = video.play();
    promise?.catch(() => setPlaying(false));
  }, [active]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video
        .play()
        .then(() => setPlaying(true))
        .catch(() => undefined);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      className="workshop-reels"
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("button")) return;
        pointerStart.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return;
        const distance = event.clientX - pointerStart.current;
        pointerStart.current = null;
        if (Math.abs(distance) < 48) return;
        if (distance < 0) next();
        else previous();
      }}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
      onPointerLeave={() => {
        pointerStart.current = null;
      }}
    >
      <div className="workshop-reel-stage">
        <video
          key={current.src}
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="metadata"
          poster={current.poster}
          onClick={togglePlayback}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={next}
          onTimeUpdate={(event) => {
            if (
              current.maxSeconds &&
              event.currentTarget.currentTime >= current.maxSeconds
            ) {
              next();
            }
          }}
          aria-label={current.title}
        >
          <source src={current.src} type="video/mp4" />
        </video>

        <div className="workshop-reel-vignette" aria-hidden="true" />

        <button
          className="workshop-reel-arrow workshop-reel-prev"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            previous();
          }}
          aria-label="Previous stitching reel"
        >
          ←
        </button>
        <button
          className="workshop-reel-arrow workshop-reel-next"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            next();
          }}
          aria-label="Next stitching reel"
        >
          →
        </button>

        <button
          className="workshop-reel-play"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            togglePlayback();
          }}
          aria-label={playing ? "Pause reel" : "Play reel"}
        >
          {playing ? "Ⅱ" : "▶"}
        </button>

        <span className="workshop-reel-counter">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(reels.length).padStart(2, "0")}
        </span>
      </div>

      <div className="bloom-workshop-label workshop-reel-label">
        <div className="workshop-reel-copy">
          <span>{current.label}</span>
          <strong>{current.title}</strong>
        </div>

        <div className="workshop-reel-tabs" aria-label="Choose stitching reel">
          {reels.map((reel, index) => (
            <button
              type="button"
              key={reel.src}
              className={index === active ? "is-active" : ""}
              aria-label={"Show stitching reel " + (index + 1)}
              aria-current={index === active ? "true" : undefined}
              onClick={() => show(index)}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

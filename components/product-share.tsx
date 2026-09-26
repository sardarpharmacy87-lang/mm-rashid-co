"use client";
import { useState } from "react";
export function ProductShare({ name }: { name: string }) {
  const [message, setMessage] = useState("");
  return (
    <div className="product-share">
      <span>Share this piece</span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(location.href);
            setMessage("Link copied");
          } catch {
            setMessage("Copy this page’s address to share it.");
          }
        }}
      >
        Copy link
      </button>
      <button
        type="button"
        onClick={() => {
          window.open(
            "https://wa.me/?text=" +
              encodeURIComponent(name + " " + location.href),
            "_blank",
            "noopener,noreferrer",
          );
        }}
      >
        WhatsApp ↗
      </button>
      <span role="status">{message}</span>
    </div>
  );
}

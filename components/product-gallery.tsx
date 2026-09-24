"use client";

import { useState } from "react";

export function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const activeImage = images[active] ?? null;

  return (
    <div className="product-gallery premium-product-gallery">
      <div className="product-main-image">
        {activeImage ? (
          <img src={activeImage} alt={productName + " view " + (active + 1)} />
        ) : (
          <div className="store-image-placeholder">MM RASHID &amp; CO.</div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="product-thumbnails" aria-label={productName + " images"}>
          {images.map((image, index) => (
            <button
              type="button"
              key={image}
              className={index === active ? "is-active" : ""}
              onClick={() => setActive(index)}
              aria-label={"Show " + productName + " view " + (index + 1)}
              aria-pressed={index === active}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

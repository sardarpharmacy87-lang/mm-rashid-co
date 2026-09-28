# Royal hero artwork

The owner supplied the contact composition and the homepage design reference on 2026-09-26. The existing company logo and established business history are retained. The reference text, menu and button have been implemented in HTML so they remain accessible, responsive and clickable.

Final website assets:

- `public/images/royal/contact-regalia.webp` — the second supplied image, with composition unchanged and WebP compression for delivery.
- `public/images/royal/hero-regalia-no-gloves.webp` — archived background, edited with the built-in image-generation tool to remove the gloves at the owner's request, then encoded as WebP. The previous artwork is retained as `hero-regalia.webp`.

On 2026-09-27 the homepage changed to a white product studio featuring an existing catalogue image. The owner supplied a video of an interactive car unveiling as a motion reference. The hero adapts its reveal concept using a navy CSS fabric cover and a keyboard-accessible slider. It does not claim to be a 3D model or a cloth physics simulation. Product colours and photographs are unchanged.

On 2026-09-28 the owner supplied the new circular logo. `public/images/royal/reveal-logo.webp` is the supplied transparent PNG, resized to 512 pixels wide and encoded as WebP without changing the artwork. The logo rotates into its upright position once when the hero mounts. The curtain reads “Slide to reveal our featured piece”. Reveal progress only moves forward; the fully revealed state has no reset action. Each new tab starts closed, without browser storage. Reduced-motion settings disable both rotation and the cover transition. Admins choose the product in Website settings → Homepage reveal; MASON Jacket remains the automatic first choice when available.

Final glove-removal prompt (built-in tool):

> Use case: precise-object-edit. Edit target: the supplied website hero background. Remove ONLY the pair of white gloves near the lower-left centre, including their blue embroidered marks. Seamlessly reconstruct the black marble pedestal and its natural reflections where the gloves were. Keep the blue and gold ceremonial apron, collar, cuffs, embroidered symbols, book, architecture, lighting, colors, camera angle, landscape composition and dark empty left side unchanged. Do not add any objects, text, logos or gloves. Preserve the same 1536x1024 canvas and premium photographic appearance.

Contact hours: Monday–Sunday, 24 hours, Pakistan time (UTC+5), as requested by the owner.

Built-in image-edit prompt:

> Use case: precise-object-edit. Edit target: the attached royal navy and gold website mockup. Create a clean photographic hero BACKGROUND for a working website, landscape 1536x1024. Preserve the exact product arrangement and details on the right: royal blue gold embroidered Masonic collar, cuffs and white/blue apron with gold fringe, the white gloves on black marble near lower centre, and classical architecture/columns behind. Preserve rich deep midnight navy, vivid royal-blue velvet, metallic gold embroidery and warm lighting. Remove ALL website UI from the image: remove the upper-left MMR logo and brand text, all top navigation and icons, ALL large left text and decorative separators and CTA button, and the entire bottom feature strip and white OUR PRODUCTS section. Seamlessly reconstruct dark navy photographic atmospheric negative space on the left half where text was, and black marble along the bottom. Keep right-hand regalia fully in frame and detailed, occupying approximately right half with left half dark and uncluttered for real HTML copy. Extend the scene over the removed bottom UI. No typography, no lettering, no logos added, no UI, no buttons, no graphic frames. The embroidered symbols on the PRODUCTS remain unchanged. This is an edit of the provided composition, not a different product scene.

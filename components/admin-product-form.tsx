"use client";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { prepareProductImages } from "@/lib/product-image-upload";

export function AdminProductForm({
  action,
  children,
  className,
}: {
  action: (form: FormData) => Promise<void>;
  children: ReactNode;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const busy = useRef(false);
  const uploaded = useRef(new Map<File, string>());
  return (
    <form
      className={className}
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        if (busy.current) return;
        const data = new FormData(event.currentTarget);
        busy.current = true;
        setError("");
        startTransition(async () => {
          try {
            const client = createClient();
            await prepareProductImages(data, async (file) => {
              const cached = uploaded.current.get(file);
              if (cached) return cached;
              setProgress("Uploading " + file.name + "…");
              const extension =
                file.type === "image/png"
                  ? "png"
                  : file.type === "image/webp"
                    ? "webp"
                    : "jpg";
              const path = "catalogue/" + crypto.randomUUID() + "." + extension;
              const { error: uploadError } = await client.storage
                .from("product-images")
                .upload(path, file, {
                  cacheControl: "31536000",
                  contentType: file.type,
                  upsert: false,
                });
              if (uploadError)
                throw new Error("Image upload failed: " + uploadError.message);
              const { data: image } = client.storage
                .from("product-images")
                .getPublicUrl(path);
              uploaded.current.set(file, image.publicUrl);
              return image.publicUrl;
            });
            setProgress("Saving product…");
            // Only text and image URLs reach the Server Action, never file bytes.
            await action(data);
          } catch (failure) {
            setError(
              failure instanceof Error
                ? failure.message
                : "Unable to save the product. Your form is still here; please try again.",
            );
          } finally {
            busy.current = false;
            setProgress("");
          }
        });
      }}
    >
      {error && (
        <p role="alert" className="form-alert form-alert-error">
          {error}
        </p>
      )}
      {pending && <p role="status">{progress || "Preparing images…"}</p>}
      <fieldset
        disabled={pending}
        style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
      >
        {children}
      </fieldset>
    </form>
  );
}

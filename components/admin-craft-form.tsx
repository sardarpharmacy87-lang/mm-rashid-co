"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CRAFT_BUCKET, CRAFT_IMAGE_PREFIX, type CraftItem } from "@/lib/craft";
import { saveCraft, deleteCraft } from "@/app/admin/craft/actions";

export function AdminCraftForm({ item }: { item?: CraftItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const busy = useRef(false);
  const newId = useRef("");
  const uploaded = useRef<{ file: File; path: string } | null>(null);

  return (
    <form className="portal-form portal-card commerce-admin-form" aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        if (busy.current) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        busy.current = true;
        setError("");
        startTransition(async () => {
          try {
            if (!newId.current) newId.current = crypto.randomUUID();
            data.set("id", item?.id ?? newId.current);
            let path = item?.image_path ?? "";
            const file = data.get("picture");
            if (file instanceof File && file.size > 0) {
              if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
                throw new Error("Choose a JPG, PNG or WebP picture.");
              if (file.size > 5 * 1024 * 1024)
                throw new Error("The picture must be 5 MB or smaller.");
              if (uploaded.current?.file === file) {
                path = uploaded.current.path;
              } else {
                setStatus("Uploading picture…");
                const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
                path = "craft/" + crypto.randomUUID() + "." + ext;
                const { error: uploadError } = await createClient().storage.from(CRAFT_BUCKET).upload(path, file, {
                  contentType: file.type, cacheControl: "31536000", upsert: false,
                });
                if (uploadError) throw new Error("Picture upload failed. Please try again.");
                uploaded.current = { file, path };
              }
            }
            if (!path) throw new Error("Choose a picture.");
            data.delete("picture");
            data.set("imagePath", path);
            setStatus("Saving craft entry…");
            const result = await saveCraft(data);
            if (result.error) throw new Error(result.error);
            if (!item) {
              form.reset();
              newId.current = "";
              uploaded.current = null;
            }
            setStatus("Craft entry saved.");
            router.refresh();
          } catch (failure) {
            setError(failure instanceof Error ? failure.message : "Unable to save. Please try again.");
            setStatus("");
          } finally { busy.current = false; }
        });
      }}>
      {error && <p role="alert" className="form-alert form-alert-error">{error}</p>}
      {status && <p role="status">{status}</p>}
      <fieldset disabled={pending} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        {item && <Image src={CRAFT_IMAGE_PREFIX + item.image_path} alt={item.title} width={480} height={360} style={{ width: "100%", maxWidth: 480, height: "auto", objectFit: "contain" }} />}
        <div className="form-grid">
          <label className="form-span-two">Product / craft title<input name="title" maxLength={160} defaultValue={item?.title ?? ""} required /></label>
          <label className="form-span-two">Description<textarea name="description" rows={5} maxLength={5000} defaultValue={item?.description ?? ""} required /></label>
          <label className="form-span-two">{item ? "Replace picture (optional)" : "Picture"}<input name="picture" type="file" accept="image/jpeg,image/png,image/webp" required={!item} /><span>JPG, PNG or WebP. Maximum 5 MB.</span></label>
          <label>Display order<input name="sortOrder" type="number" min={-100000} max={100000} step={1} defaultValue={item?.sort_order ?? 0} required /></label>
        </div>
        <label><input type="checkbox" name="active" defaultChecked={item?.active ?? true} /> Show in Our Craft</label>
        <button className="portal-button" type="submit">{pending ? "Please wait…" : item ? "Save changes" : "Add craft entry"}</button>
        {item && <button type="button" className="admin-slide-delete" onClick={() => {
          if (busy.current || !window.confirm("Remove this craft entry?")) return;
          busy.current = true;
          setError("");
          startTransition(async () => {
            try {
              const result = await deleteCraft(item.id);
              if (result.error) throw new Error(result.error);
              router.refresh();
            } catch (failure) {
              setError(failure instanceof Error ? failure.message : "Unable to remove entry.");
            } finally { busy.current = false; }
          });
        }}>Remove entry</button>}
      </fieldset>
    </form>
  );
}

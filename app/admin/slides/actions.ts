"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function storagePathFromUrl(url: string) {
  const marker = "/storage/v1/object/public/hero-slides/";
  const index = url.indexOf(marker);
  if (index < 0) return null;
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

function safeDelay(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 5000;
  return Math.min(30000, Math.max(2000, Math.round(parsed)));
}

export async function createSlides(formData: FormData) {
  await requireAdmin();

  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!files.length) redirect("/admin/slides?error=" + encodeURIComponent("Choose at least one image"));
  if (files.length > 10) redirect("/admin/slides?error=" + encodeURIComponent("Upload up to 10 slides at one time"));

  const delayMs = safeDelay(textValue(formData, "delayMs"));
  const supabase = await createClient();

  const { data: latest } = await supabase
    .from("homepage_slides")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sortOrder = (latest?.sort_order ?? 0) + 10;
  const rows: Array<{image_url:string;alt_text:string;sort_order:number;delay_ms:number;active:boolean}> = [];

  try {
    for (const file of files) {
      if (file.size > 8 * 1024 * 1024) throw new Error("Each slide image must be 8MB or smaller.");
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        throw new Error("Slide images must be JPG, PNG or WebP.");
      }

      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = "homepage/" + Date.now() + "-" + crypto.randomUUID() + "." + extension;

      const { error: uploadError } = await supabase.storage.from("hero-slides").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from("hero-slides").getPublicUrl(path);
      rows.push({
        image_url: data.publicUrl,
        alt_text: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        sort_order: sortOrder,
        delay_ms: delayMs,
        active: true,
      });
      sortOrder += 10;
    }

    const { error } = await supabase.from("homepage_slides").insert(rows);
    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/admin/slides");
    redirect("/admin/slides?message=" + encodeURIComponent(rows.length + " slide(s) added"));
  } catch (error) {
    redirect("/admin/slides?error=" + encodeURIComponent(error instanceof Error ? error.message : "Unable to add slides"));
  }
}

export async function updateSlide(formData: FormData) {
  await requireAdmin();

  const slideId = textValue(formData, "slideId");
  if (!slideId) redirect("/admin/slides?error=Slide%20not%20found");

  const supabase = await createClient();
  const { error } = await supabase
    .from("homepage_slides")
    .update({
      sort_order: Number(textValue(formData, "sortOrder")) || 0,
      delay_ms: safeDelay(textValue(formData, "delayMs")),
      active: formData.get("active") === "on",
      alt_text: textValue(formData, "altText") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", slideId);

  if (error) redirect("/admin/slides?error=" + encodeURIComponent(error.message));

  revalidatePath("/");
  revalidatePath("/admin/slides");
  redirect("/admin/slides?message=" + encodeURIComponent("Slide updated"));
}

export async function deleteSlide(formData: FormData) {
  await requireAdmin();

  const slideId = textValue(formData, "slideId");
  if (!slideId) redirect("/admin/slides?error=Slide%20not%20found");

  const supabase = await createClient();
  const { data: slide } = await supabase
    .from("homepage_slides")
    .select("image_url")
    .eq("id", slideId)
    .single();

  const { error } = await supabase.from("homepage_slides").delete().eq("id", slideId);
  if (error) redirect("/admin/slides?error=" + encodeURIComponent(error.message));

  const storagePath = slide?.image_url ? storagePathFromUrl(slide.image_url) : null;
  if (storagePath) await supabase.storage.from("hero-slides").remove([storagePath]);

  revalidatePath("/");
  revalidatePath("/admin/slides");
  redirect("/admin/slides?message=" + encodeURIComponent("Slide removed"));
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { safeHttpsUrl } from "@/lib/payment-rules";

function cleanUrl(value: FormDataEntryValue | null) {
  const url = String(value ?? "").trim();
  return safeHttpsUrl(url);
}

export async function saveSocialSettings(formData: FormData) {
  await requireAdmin();
  const keys = [
    "facebook_url",
    "instagram_url",
    "tiktok_url",
    "pinterest_url",
    "youtube_url",
    "linkedin_url",
  ];
  if (
    keys.some(
      (key) =>
        String(formData.get(key) || "").trim() && !cleanUrl(formData.get(key)),
    )
  )
    redirect("/admin/settings?saved=invalid");
  const supabase = await createClient();

  const { error } = await supabase.from("site_settings").upsert({
    id: "main",
    facebook_url: cleanUrl(formData.get("facebook_url")),
    instagram_url: cleanUrl(formData.get("instagram_url")),
    tiktok_url: cleanUrl(formData.get("tiktok_url")),
    pinterest_url: cleanUrl(formData.get("pinterest_url")),
    youtube_url: cleanUrl(formData.get("youtube_url")),
    linkedin_url: cleanUrl(formData.get("linkedin_url")),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect("/admin/settings?saved=error");
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export async function saveTranslationSettings(form: FormData) {
  await requireAdmin();
  const key = String(form.get("translation_key") || "").trim();
  const languages = Array.from(
    new Set([
      "en",
      ...String(form.get("translation_languages") || "")
        .split(/[,\s]+/)
        .filter(Boolean),
    ]),
  );
  if (
    (key && !/^wg_[a-zA-Z0-9_-]{10,120}$/.test(key)) ||
    languages.length > 250 ||
    languages.some((code) => !/^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/.test(code))
  )
    redirect("/admin/settings?translation=invalid");
  const db = await createClient();
  const { error } = await db
    .from("storefront_preferences")
    .upsert({
      id: "main",
      translation_key: key,
      translation_languages: languages,
      updated_at: new Date().toISOString(),
    });
  revalidatePath("/", "layout");
  redirect("/admin/settings?translation=" + (error ? "error" : "1"));
}

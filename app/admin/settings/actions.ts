"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

function cleanUrl(value: FormDataEntryValue | null) {
  const url = String(value ?? "").trim();
  return url || null;
}

export async function saveSocialSettings(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .upsert({
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

"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const entrySchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1, "Enter a title.").max(160),
  description: z.string().trim().min(1, "Enter a description.").max(5000),
  image_path: z.string().regex(/^craft\/[0-9a-f-]{36}\.(jpg|png|webp)$/, "Choose a picture."),
  sort_order: z.coerce.number().int().min(-100000).max(100000),
  active: z.boolean(),
});

export async function saveCraft(form: FormData): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = entrySchema.safeParse({
    id: form.get("id"),
    title: form.get("title"),
    description: form.get("description"),
    image_path: form.get("imagePath"),
    sort_order: form.get("sortOrder"),
    active: form.get("active") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.from("craft_items").upsert({
    ...parsed.data,
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: "Unable to save this craft entry. Please try again." };
  revalidatePath("/capabilities");
  revalidatePath("/admin/craft");
  return {};
}

export async function deleteCraft(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return { error: "Invalid craft entry." };
  const supabase = await createClient();
  const { error } = await supabase.from("craft_items").delete().eq("id", id);
  if (error) return { error: "Unable to remove this craft entry. Please try again." };
  revalidatePath("/capabilities");
  revalidatePath("/admin/craft");
  return {};
}

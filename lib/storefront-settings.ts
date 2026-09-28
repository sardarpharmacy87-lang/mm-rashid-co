import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
export const getStorefrontSettings = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("storefront_preferences")
    .select("translation_key,translation_languages,featured_product_id")
    .eq("id", "main")
    .maybeSingle();
  return {
    translationKey: (data?.translation_key as string) || "",
    languages: (data?.translation_languages as string[]) || ["en"],
    featuredProductId: (data?.featured_product_id as string) || null,
    configured: !error,
  };
});

import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./supabase/config";

// Anonymous client only: never put customer sessions or profiles in shared cache.
function publicClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
export const getPublicPreferences = unstable_cache(
  async () => {
    const { data, error } = await publicClient()
      .from("storefront_preferences")
      .select("translation_key,translation_languages,featured_product_id")
      .eq("id", "main")
      .abortSignal(AbortSignal.timeout(5000))
      .maybeSingle();
    if (error) throw new Error("Storefront preferences unavailable");
    return data;
  },
  ["public-preferences-v1", SUPABASE_URL],
  { revalidate: 300, tags: ["storefront-preferences"] },
);

export const getPublicGroups = unstable_cache(
  async () => {
    const { data, error } = await publicClient()
      .from("product_groups")
      .select("id,name,slug")
      .eq("active", true)
      .order("sort_order")
      .abortSignal(AbortSignal.timeout(5000));
    if (error) throw new Error("Product groups unavailable");
    return data ?? [];
  },
  ["public-groups-v1", SUPABASE_URL],
  { revalidate: 60, tags: ["storefront-groups"] },
);

export const getPublicSocialSettings = unstable_cache(
  async () => {
    const { data, error } = await publicClient()
      .from("site_settings")
      .select(
        "facebook_url,instagram_url,tiktok_url,pinterest_url,youtube_url,linkedin_url",
      )
      .eq("id", "main")
      .abortSignal(AbortSignal.timeout(5000))
      .maybeSingle();
    if (error) throw new Error("Social settings unavailable");
    return data;
  },
  ["public-social-v1", SUPABASE_URL],
  { revalidate: 300, tags: ["storefront-social"] },
);

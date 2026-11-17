import { cache } from "react";
import { getPublicPreferences } from "./public-storefront";
export const getStorefrontSettings = cache(async () => {
  try {
    const data = await getPublicPreferences();
    return {
      translationKey: (data?.translation_key as string) || "",
      languages: (data?.translation_languages as string[]) || ["en"],
      featuredProductId: (data?.featured_product_id as string) || null,
      configured: true,
    };
  } catch {
    // Failure is handled outside the shared cache, so it cannot poison the cache.
    return {
      translationKey: "",
      languages: ["en"],
      featuredProductId: null,
      configured: false,
    };
  }
});

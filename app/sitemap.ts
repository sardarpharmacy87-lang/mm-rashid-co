import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mm-rashid-co-l5hh.vercel.app";

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: baseUrl + "/products",
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: baseUrl + "/privacy",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: baseUrl + "/terms",
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("active", true)
      .order("updated_at", { ascending: false });

    const productEntries: MetadataRoute.Sitemap = (data ?? []).map((product) => ({
      url: baseUrl + "/products/" + product.slug,
      lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}

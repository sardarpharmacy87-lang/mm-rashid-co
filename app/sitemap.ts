import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mm-rashid-co-l5hh.vercel.app";
  const supabase = await createClient();

  const { data: products = [] } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("active", true);

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: baseUrl + "/products", changeFrequency: "daily", priority: 0.9 },
    ...products.map((product) => ({
      url: baseUrl + "/products/" + product.slug,
      lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

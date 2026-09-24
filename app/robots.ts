import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://mm-rashid-co-l5hh.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/customer/",
          "/auth/",
          "/sign-in",
          "/sign-up",
          "/forgot-password",
          "/update-password",
        ],
      },
    ],
    sitemap: baseUrl + "/sitemap.xml",
    host: baseUrl,
  };
}

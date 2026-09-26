import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gjdyrkbabmdfgxcsvenw.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
      },
      {
        protocol: "https",
        hostname: "gjdyrkbabmdfgxcsvenw.supabase.co",
        pathname: "/storage/v1/object/public/hero-slides/**",
      },
    ],
    deviceSizes: [480, 640, 750, 828, 1080, 1200, 1600],
    imageSizes: [64, 96, 128, 256, 384],
  },
  experimental: {
    // Some local Windows environments restrict child processes. CI keeps Next's defaults.
    ...(process.env.MMR_LOCAL_BUILD === "1"
      ? { workerThreads: true, useTypeScriptCli: false, cpus: 2 }
      : {}),
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;

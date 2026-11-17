import { Suspense } from "react";
import Loading from "./loading";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./commerce.css";
import "./portal.css";
import "./atelier.css";
import "./royal.css";
import "./studio.css";
import { SupportChat } from "@/components/support-chat";
import { LocaleProvider } from "@/components/locale-provider";
import { getStorefrontSettings } from "@/lib/storefront-settings";
import { cookies, headers } from "next/headers";
import { regionCodes } from "@/lib/regions";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://mm-rashid-co-l5hh.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MM Rashid & Co. | Ceremonial Regalia & Bullion Embroidery",
    template: "%s | MM Rashid & Co.",
  },
  description:
    "Handcrafted ceremonial regalia, goldwork, bullion embroidery, badges, banners, caps, headwear and custom insignia from Sialkot, Pakistan.",
  keywords: [
    "ceremonial regalia",
    "bullion embroidery",
    "goldwork embroidery",
    "custom badges",
    "ceremonial headwear",
    "Sialkot embroidery",
    "MM Rashid & Co",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "MM Rashid & Co.",
    title: "MM Rashid & Co. | Ceremonial Regalia & Bullion Embroidery",
    description:
      "Handcrafted ceremonial regalia, goldwork, bullion embroidery and custom insignia from Sialkot, Pakistan.",
    images: [{ url: "/mm-rashid-logo.png", alt: "MM Rashid & Co. emblem" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MM Rashid & Co.",
    description:
      "Handcrafted ceremonial regalia, bullion embroidery and custom insignia from Sialkot.",
    images: ["/mm-rashid-logo.png"],
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#041329",
};

async function StorefrontLocale({ children }: { children: React.ReactNode }) {
  const [settings, jar, requestHeaders] = await Promise.all([
    getStorefrontSettings(),
    cookies(),
    headers(),
  ]);
  const preferred =
    jar.get("mmr-country")?.value ||
    requestHeaders.get("x-vercel-ip-country") ||
    "PK";
  const initialCountry = regionCodes.includes(preferred) ? preferred : "PK";
  return (
    <LocaleProvider
      initialCountry={initialCountry}
      translationKey={settings.translationKey}
      languages={settings.languages}
    >
      {children}
      <SupportChat />
    </LocaleProvider>
  );
}
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Suspense fallback={<Loading />}>
          <StorefrontLocale>{children}</StorefrontLocale>
        </Suspense>
      </body>
    </html>
  );
}

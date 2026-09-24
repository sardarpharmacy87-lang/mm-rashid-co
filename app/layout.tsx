import type { Metadata, Viewport } from "next";
import { CommerceProvider } from "@/components/commerce-provider";
import "./globals.css";
import "./commerce.css";
import "./portal.css";

export const metadata: Metadata = {
  title: {
    default: "MM Rashid & Co. | Ceremonial Regalia & Bullion Embroidery",
    template: "%s | MM Rashid & Co.",
  },
  description:
    "Handcrafted ceremonial regalia, goldwork, bullion embroidery, badges, aprons, banners, caps and custom insignia from Sialkot, Pakistan.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#082452",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CommerceProvider>{children}</CommerceProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./portal.css";

export const metadata: Metadata = {
  title: "MM Rashid & Co. | Goldwork & Bullion Embroidery",
  description:
    "Handcrafted goldwork, bullion embroidery, ceremonial regalia, badges, crests, cap peaks and custom insignia from Sialkot, Pakistan.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071a47",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

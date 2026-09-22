import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MM Rashid & Co. | Goldwork & Bullion Embroidery",
  description: "Handcrafted goldwork, bullion embroidery and ceremonial regalia from Sialkot, Pakistan."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
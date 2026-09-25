import Link from "next/link";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";

type SocialLink = {
  label: string;
  href: string | null;
};

export async function StoreFooter() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("facebook_url, instagram_url, tiktok_url, pinterest_url, youtube_url, linkedin_url")
    .eq("id", "main")
    .maybeSingle();

  const socialLinks: SocialLink[] = [
    { label: "Facebook", href: settings?.facebook_url ?? null },
    { label: "Instagram", href: settings?.instagram_url ?? null },
    { label: "TikTok", href: settings?.tiktok_url ?? null },
    { label: "Pinterest", href: settings?.pinterest_url ?? null },
    { label: "YouTube", href: settings?.youtube_url ?? null },
    { label: "LinkedIn", href: settings?.linkedin_url ?? null },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="commerce-footer bloom-footer clean-store-footer" id="contact">
      <div className="clean-footer-main">
        <div className="clean-footer-brand">
          <Brand footer />
          <p>
            Ceremonial embroidery, bullion work and regalia handcrafted in Sialkot since 1922.
          </p>
          {socialLinks.length ? (
            <div className="clean-footer-social" aria-label="Social media">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href!}
                  target="_blank"
                  rel="noreferrer"
                >
                  {social.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="clean-footer-column">
          <strong>Shop</strong>
          <Link href="/products">All products</Link>
          <Link href="/capabilities">Capabilities</Link>
          <Link href="/catalogue">Catalogue</Link>
          <Link href="/#heritage">Our history</Link>
          <Link href="/#workshop">Workshop</Link>
        </div>

        <div className="clean-footer-column">
          <strong>Customer service</strong>
          <Link href="/customer">Customer account</Link>
          <Link href="/sign-up">Request a quote</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms &amp; conditions</Link>
        </div>

        <div className="clean-footer-column clean-footer-contact">
          <strong>Contact us</strong>
          <span>Commissioner Road, Sialkot 51310, Pakistan</span>
          <a href="tel:+923343342223">+92 334 334 2223</a>
          <a href="mailto:mmrashidco@hotmail.com">mmrashidco@hotmail.com</a>
          <span>Please contact us before visiting.</span>
        </div>
      </div>

      <div className="clean-footer-bottom">
        <span>© {new Date().getFullYear()} MM Rashid &amp; Co. All rights reserved.</span>
        <span>Handcrafted in Sialkot · Since 1922</span>
      </div>
    </footer>
  );
}

import { createClient } from "@/lib/supabase/server";
import {
  saveSocialSettings,
  saveTranslationSettings,
  saveFeaturedProduct,
} from "./actions";
import { getStorefrontSettings } from "@/lib/storefront-settings";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{
    saved?: string;
    translation?: string;
    hero?: string;
  }>;
};

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  const { saved, translation, hero } = await searchParams;
  const preferences = await getStorefrontSettings();
  const supabase = await createClient();
  const { data: heroProducts, error: heroProductsError } = await supabase
    .from("products")
    .select("id,name,sku")
    .eq("active", true)
    .not("primary_image", "is", null)
    .neq("primary_image", "")
    .order("name");
  const savedHeroAvailable =
    !preferences.featuredProductId ||
    heroProducts?.some((p) => p.id === preferences.featuredProductId);

  const { data: settings } = await supabase
    .from("site_settings")
    .select(
      "facebook_url, instagram_url, tiktok_url, pinterest_url, youtube_url, linkedin_url",
    )
    .eq("id", "main")
    .maybeSingle();

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Website settings</p>
          <h1>Website settings</h1>
          <p>
            Choose your homepage feature and manage your website connections.
          </p>
        </div>
      </div>

      <section className="portal-section" id="hero-settings">
        <h2>Homepage reveal</h2>
        <p>
          Reveal your rotating company logo, or choose a product to feature
          instead. A product selection updates its image, name and link
          together.
        </p>
        {hero && (
          <p
            role="status"
            className={
              "form-alert " +
              (hero === "1" ? "form-alert-success" : "form-alert-error")
            }
          >
            {hero === "1"
              ? "Homepage reveal saved."
              : hero === "invalid"
                ? "Choose an active product with an image."
                : "The featured product could not be saved. Please try again."}
          </p>
        )}
        {heroProductsError && (
          <p role="alert">
            Products could not be loaded. Refresh the page to try again.
          </p>
        )}
        {!savedHeroAvailable && (
          <p>
            The previously selected product is no longer available. The homepage
            is showing your company logo.
          </p>
        )}
        <form action={saveFeaturedProduct} className="portal-form">
          <label>
            Reveal content
            <select
              name="featured_product_id"
              defaultValue={
                savedHeroAvailable ? preferences.featuredProductId || "" : ""
              }
            >
              <option value="">Company logo · rotating reveal</option>
              {(heroProducts || []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                  {product.sku ? ` · ${product.sku}` : ""}
                </option>
              ))}
            </select>
          </label>
          <p>
            Only active products with a main image are listed. If a selected
            product is removed or hidden, your company logo will be shown.
          </p>
          <button
            className="portal-button"
            disabled={!!heroProductsError || !preferences.configured}
          >
            Save homepage reveal
          </button>
          <Link href="/" target="_blank" rel="noopener noreferrer">
            Preview homepage ↗
          </Link>
        </form>
      </section>

      {saved === "1" ? (
        <p className="form-alert form-alert-success">
          Social media settings saved.
        </p>
      ) : null}
      {saved === "error" ? (
        <p className="form-alert form-alert-error">
          Settings could not be saved.
        </p>
      ) : null}
      {saved === "invalid" ? (
        <p className="form-alert form-alert-error">
          Use a complete https:// URL for each social profile.
        </p>
      ) : null}
      <p>
        <Link className="portal-button" href="/admin/payments">
          Configure your three payment methods
        </Link>
      </p>

      <section className="portal-section">
        <form action={saveSocialSettings} className="portal-form">
          <div className="form-grid">
            <label>
              Facebook
              <input
                name="facebook_url"
                type="url"
                placeholder="https://facebook.com/..."
                defaultValue={settings?.facebook_url ?? ""}
              />
            </label>
            <label>
              Instagram
              <input
                name="instagram_url"
                type="url"
                placeholder="https://instagram.com/..."
                defaultValue={settings?.instagram_url ?? ""}
              />
            </label>
            <label>
              TikTok
              <input
                name="tiktok_url"
                type="url"
                placeholder="https://tiktok.com/@..."
                defaultValue={settings?.tiktok_url ?? ""}
              />
            </label>
            <label>
              Pinterest
              <input
                name="pinterest_url"
                type="url"
                placeholder="https://pinterest.com/..."
                defaultValue={settings?.pinterest_url ?? ""}
              />
            </label>
            <label>
              YouTube
              <input
                name="youtube_url"
                type="url"
                placeholder="https://youtube.com/..."
                defaultValue={settings?.youtube_url ?? ""}
              />
            </label>
            <label>
              LinkedIn
              <input
                name="linkedin_url"
                type="url"
                placeholder="https://linkedin.com/company/..."
                defaultValue={settings?.linkedin_url ?? ""}
              />
            </label>
          </div>

          <button className="portal-button" type="submit">
            Save social links
          </button>
        </form>
      </section>
      <section className="portal-section">
        <h2>Countries &amp; languages</h2>
        <p>
          All countries and territories are available in the country selector.
          Country suggests a language until a customer explicitly chooses their
          own language. That choice is preserved independently.
        </p>
        <p>
          Connect a Weglot website translation project for full-page
          translation. Activate your chosen languages in Weglot, then enter the
          matching codes here. Only configured languages appear to visitors.
          Translation coverage and usage depend on your provider plan; no
          service subscription is created by saving this form.
        </p>
        {!preferences.configured && (
          <p className="form-alert form-alert-error">
            Apply supabase/storefront-upgrade.sql before saving translation
            settings.
          </p>
        )}
        {translation && (
          <p
            role="status"
            className={
              "form-alert " +
              (translation === "1" ? "form-alert-success" : "form-alert-error")
            }
          >
            {translation === "1"
              ? "Translation settings saved."
              : translation === "invalid"
                ? "Check your public Weglot website key and language codes."
                : "Could not save translation settings."}
          </p>
        )}
        <form action={saveTranslationSettings} className="portal-form">
          <label>
            Weglot public website key
            <input
              name="translation_key"
              defaultValue={preferences.translationKey}
              placeholder="wg_…"
              autoComplete="off"
              maxLength={123}
            />
          </label>
          <label>
            Enabled language codes
            <textarea
              name="translation_languages"
              rows={3}
              defaultValue={preferences.languages.join(", ")}
              placeholder="en, ur, ar, fr, de, es, it, pt, zh, ja, ko, hi"
            />
          </label>
          <p>
            Use the public JavaScript integration key, not a secret translation
            API credential. Private accounts, quotations and checkout are
            excluded from third-party translation.{" "}
            <a
              href="https://developers.weglot.com/javascript/javascript"
              target="_blank"
              rel="noreferrer"
            >
              Provider setup instructions ↗
            </a>
          </p>
          <button className="portal-button" disabled={!preferences.configured}>
            Save language settings
          </button>
        </form>
      </section>
    </main>
  );
}

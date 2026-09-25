import { createClient } from "@/lib/supabase/server";
import { saveSocialSettings } from "./actions";

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  const { saved } = await searchParams;
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("facebook_url, instagram_url, tiktok_url, pinterest_url, youtube_url, linkedin_url")
    .eq("id", "main")
    .maybeSingle();

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Website settings</p>
          <h1>Social media</h1>
          <p>Add or change social links at any time. Leave a field blank to hide that platform from the website.</p>
        </div>
      </div>

      {saved === "1" ? <p className="form-alert form-alert-success">Social media settings saved.</p> : null}
      {saved === "error" ? <p className="form-alert form-alert-error">Settings could not be saved.</p> : null}

      <section className="portal-section">
        <form action={saveSocialSettings} className="portal-form">
          <div className="form-grid">
            <label>
              Facebook
              <input name="facebook_url" type="url" placeholder="https://facebook.com/..." defaultValue={settings?.facebook_url ?? ""} />
            </label>
            <label>
              Instagram
              <input name="instagram_url" type="url" placeholder="https://instagram.com/..." defaultValue={settings?.instagram_url ?? ""} />
            </label>
            <label>
              TikTok
              <input name="tiktok_url" type="url" placeholder="https://tiktok.com/@..." defaultValue={settings?.tiktok_url ?? ""} />
            </label>
            <label>
              Pinterest
              <input name="pinterest_url" type="url" placeholder="https://pinterest.com/..." defaultValue={settings?.pinterest_url ?? ""} />
            </label>
            <label>
              YouTube
              <input name="youtube_url" type="url" placeholder="https://youtube.com/..." defaultValue={settings?.youtube_url ?? ""} />
            </label>
            <label>
              LinkedIn
              <input name="linkedin_url" type="url" placeholder="https://linkedin.com/company/..." defaultValue={settings?.linkedin_url ?? ""} />
            </label>
          </div>

          <button className="portal-button" type="submit">Save social links</button>
        </form>
      </section>
    </main>
  );
}

import Link from "next/link";
import { createSlides, deleteSlide, updateSlide } from "@/app/admin/slides/actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = { searchParams: Promise<{ error?: string; message?: string }> };

export default async function AdminSlidesPage({ searchParams }: PageProps) {
  const feedback = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("homepage_slides")
    .select("id, image_url, alt_text, sort_order, delay_ms, active, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const slides = data ?? [];

  return (
    <main className="portal-main">
      <div className="portal-title-row">
        <div>
          <p className="portal-kicker">Homepage administration</p>
          <h1>Homepage slides</h1>
          <p>Add or remove pictures, set their order, and control how long each slide stays visible.</p>
        </div>
        <Link className="portal-button" href="/">View website</Link>
      </div>

      {feedback.error ? <p className="form-alert form-alert-error">{feedback.error}</p> : null}
      {feedback.message ? <p className="form-alert form-alert-success">{feedback.message}</p> : null}

      <section className="summary-grid">
        <article><strong>{slides.length}</strong><span>Slides</span></article>
        <article><strong>{slides.filter((slide) => slide.active).length}</strong><span>Live</span></article>
        <article><strong>5 sec</strong><span>Default delay</span></article>
      </section>

      <section className="portal-section">
        <div className="portal-section-head"><div><h2>Add slide pictures</h2><p>Select 5 or 6 pictures together if you want. They are added in the order selected.</p></div></div>
        <form action={createSlides} className="portal-form portal-card commerce-admin-form">
          <div className="form-grid">
            <label className="form-span-two">Pictures<input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple required /></label>
            <label>Delay per slide (milliseconds)<input name="delayMs" type="number" min="2000" max="30000" step="500" defaultValue="5000" /></label>
          </div>
          <button className="portal-button" type="submit">Add slide pictures</button>
        </form>
      </section>

      <section className="portal-section">
        <div className="portal-section-head"><div><h2>Current slides</h2><p>Lower order numbers appear first. 5000 milliseconds = 5 seconds.</p></div></div>
        {slides.length ? (
          <div className="admin-slide-grid">
            {slides.map((slide) => (
              <article className="portal-card admin-slide-card" key={slide.id}>
                <img src={slide.image_url} alt={slide.alt_text || ""} />
                <form action={updateSlide} className="portal-form">
                  <input type="hidden" name="slideId" value={slide.id} />
                  <div className="form-grid">
                    <label>Order<input name="sortOrder" type="number" defaultValue={slide.sort_order} /></label>
                    <label>Delay (ms)<input name="delayMs" type="number" min="2000" max="30000" step="500" defaultValue={slide.delay_ms} /></label>
                    <label className="form-span-two">Image description<input name="altText" defaultValue={slide.alt_text ?? ""} /></label>
                  </div>
                  <label className="admin-slide-active"><input name="active" type="checkbox" defaultChecked={slide.active} /> Show on homepage</label>
                  <button className="portal-button" type="submit">Save slide</button>
                </form>
                <form action={deleteSlide}>
                  <input type="hidden" name="slideId" value={slide.id} />
                  <button className="admin-slide-delete" type="submit">Remove slide</button>
                </form>
              </article>
            ))}
          </div>
        ) : <div className="portal-empty"><p>No homepage slides yet.</p></div>}
      </section>
    </main>
  );
}

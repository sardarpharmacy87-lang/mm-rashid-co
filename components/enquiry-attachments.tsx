import { createClient } from "@/lib/supabase/server";
export async function EnquiryAttachments({
  id,
  customerId,
}: {
  id: string;
  customerId: string;
}) {
  const db = await createClient();
  const { data: files } = await db
    .from("enquiry_files")
    .select("id,file_name,storage_path,file_type,size_bytes")
    .eq("enquiry_id", id)
    .eq("customer_id", customerId);
  const links = await Promise.all(
    (files || [])
      .filter((f) => f.storage_path.startsWith(customerId + "/" + id + "/"))
      .map(async (f) => {
        const { data } = await db.storage
          .from("enquiry-files")
          .createSignedUrl(f.storage_path, 600);
        return { ...f, url: data?.signedUrl };
      }),
  );
  return (
    <section className="portal-section">
      <h2>Reference files</h2>
      {links.length ? (
        <ul className="reference-files">
          {links.map((f) => (
            <li key={f.id}>
              {f.url ? (
                <a href={f.url} target="_blank" rel="noreferrer">
                  {f.file_name} ↗
                </a>
              ) : (
                <span>{f.file_name} · temporarily unavailable</span>
              )}
              <small>
                {f.file_type} ·{" "}
                {(Number(f.size_bytes) / 1024 / 1024).toFixed(1)} MB
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reference files attached.</p>
      )}
      <p>
        Private links expire after 10 minutes. Refresh this page for a new link.
      </p>
    </section>
  );
}

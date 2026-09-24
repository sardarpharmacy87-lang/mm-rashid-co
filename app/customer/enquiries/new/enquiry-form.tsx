"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createEnquiry } from "@/app/customer/actions";
import {
  uploadEnquiryFiles,
  validateEnquiryFiles,
  type UploadProgress,
} from "@/lib/upload-enquiry-files";

export function EnquiryForm() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const fileError = validateEnquiryFiles(files);
    if (fileError) {
      setError(fileError);
      return;
    }

    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.delete("attachments");

    let savedEnquiryId = "";
    try {
      const result = await createEnquiry(formData);
      if (result.error || !result.enquiryId) {
        setError(result.error ?? "Unable to create the enquiry.");
        return;
      }

      savedEnquiryId = result.enquiryId;
      await uploadEnquiryFiles(files, result.enquiryId, setProgress);
      router.push(`/customer/enquiries/${result.enquiryId}?message=${encodeURIComponent("Enquiry and attachments submitted successfully")}`);
      router.refresh();
    } catch (uploadError) {
      const message = uploadError instanceof Error
        ? `The enquiry was saved, but an attachment failed: ${uploadError.message}`
        : "The enquiry was saved, but an attachment could not be uploaded.";
      if (savedEnquiryId) {
        router.push(`/customer/enquiries/${savedEnquiryId}?error=${encodeURIComponent(message)}`);
        router.refresh();
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="portal-form portal-card">
      {error ? <p className="form-alert form-alert-error">{error}</p> : null}
      <label>Enquiry title<input name="title" placeholder="Example: Gold bullion cap badges" required /></label>
      <div className="form-grid">
        <label>Work type<select name="category" defaultValue="goldwork" required><option value="goldwork">Goldwork &amp; bullion</option><option value="military">Military &amp; ceremonial</option><option value="regalia">Regalia embroidery</option><option value="crest">Custom crests</option><option value="cap-visor">Caps &amp; visors</option><option value="fez">Custom fez work</option><option value="other">Other</option></select></label>
        <label>Quantity<input name="quantity" type="number" min="1" defaultValue="1" required /></label>
        <label>Delivery country<input name="deliveryCountry" required /></label>
        <label>Required by <span className="optional">optional</span><input name="requiredBy" type="date" /></label>
      </div>
      <label>Requirements<textarea name="description" rows={8} minLength={20} placeholder="Size, colours, materials, measurements, finish and any construction details." required /></label>

      <label className="attachment-picker">
        Artwork, reference images and videos <span className="optional">optional, maximum 10 files</span>
        <input
          name="attachments"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? []);
            setFiles(selected);
            setError(validateEnquiryFiles(selected) ?? "");
          }}
        />
        <small>JPG, PNG, WebP or GIF up to 15 MB each. MP4, WebM or MOV up to 250 MB each.</small>
      </label>

      {files.length > 0 ? (
        <ul className="selected-files" aria-label="Selected attachments">
          {files.map((file) => <li key={`${file.name}-${file.lastModified}`}><span>{file.name}</span><small>{(file.size / 1024 / 1024).toFixed(1)} MB</small></li>)}
        </ul>
      ) : null}

      {progress ? (
        <div className="upload-progress" aria-live="polite">
          <div><span>Uploading {progress.current} of {progress.total}: {progress.fileName}</span><strong>{progress.percent}%</strong></div>
          <progress max="100" value={progress.percent}>{progress.percent}%</progress>
        </div>
      ) : null}

      <div className="form-actions">
        <button className="portal-button" type="submit" disabled={submitting}>
          {submitting ? (progress ? "Uploading files…" : "Saving enquiry…") : "Submit enquiry"}
        </button>
        <Link href="/customer">Cancel</Link>
      </div>
    </form>
  );
}

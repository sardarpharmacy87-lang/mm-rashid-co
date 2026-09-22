"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  uploadEnquiryFiles,
  validateEnquiryFiles,
  type UploadProgress,
} from "@/lib/upload-enquiry-files";

export function EnquiryFileUploader({ enquiryId }: { enquiryId: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload() {
    const fileError = validateEnquiryFiles(files);
    if (fileError || files.length === 0) {
      setError(fileError ?? "Select at least one file.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      await uploadEnquiryFiles(files, enquiryId, setProgress);
      setFiles([]);
      setProgress(null);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The files could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="attachment-uploader">
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        disabled={uploading}
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          setFiles(selected);
          setError(validateEnquiryFiles(selected) ?? "");
        }}
      />
      {error ? <p className="form-alert form-alert-error">{error}</p> : null}
      {progress ? <div className="upload-progress" aria-live="polite"><div><span>{progress.current}/{progress.total} · {progress.fileName}</span><strong>{progress.percent}%</strong></div><progress max="100" value={progress.percent} /></div> : null}
      <button className="portal-button portal-button-secondary" type="button" onClick={upload} disabled={uploading || files.length === 0}>
        {uploading ? "Uploading…" : "Add selected files"}
      </button>
    </div>
  );
}

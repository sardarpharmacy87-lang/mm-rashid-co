type EnquiryFile = {
  id: string;
  file_name: string;
  file_type: "image" | "video";
  mime_type: string;
  size_bytes: number;
};

export function EnquiryAttachments({ files }: { files: EnquiryFile[] }) {
  if (files.length === 0) return <div className="portal-empty"><p>No reference files have been uploaded.</p></div>;

  return (
    <div className="attachment-grid">
      {files.map((file) => {
        const source = `/api/enquiry-files/${file.id}`;
        return (
          <article className="attachment-card" key={file.id}>
            <div className="attachment-preview">
              {file.file_type === "video" ? (
                <video controls preload="metadata"><source src={source} type={file.mime_type} />Your browser cannot play this video.</video>
              ) : (
                // The protected route requires browser cookies, so the standard img element is intentional.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={source} alt={file.file_name} loading="lazy" />
              )}
            </div>
            <div className="attachment-meta"><strong title={file.file_name}>{file.file_name}</strong><small>{file.file_type} · {(file.size_bytes / 1024 / 1024).toFixed(1)} MB</small><a href={source} target="_blank" rel="noreferrer">Open original ↗</a></div>
          </article>
        );
      })}
    </div>
  );
}

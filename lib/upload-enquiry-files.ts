"use client";

import * as tus from "tus-js-client";
import { createClient } from "@/lib/supabase/client";

export const MAX_ATTACHMENT_COUNT = 10;
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 250 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export type UploadProgress = {
  current: number;
  total: number;
  fileName: string;
  percent: number;
};

export function validateEnquiryFiles(files: File[]) {
  if (files.length > MAX_ATTACHMENT_COUNT) return `Select no more than ${MAX_ATTACHMENT_COUNT} files.`;

  for (const file of files) {
    const isImage = ALLOWED_IMAGE_TYPES.has(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.has(file.type);

    if (!isImage && !isVideo) {
      return `${file.name} is not supported. Use JPG, PNG, WebP, GIF, MP4, WebM or MOV.`;
    }
    if (isImage && file.size > MAX_IMAGE_BYTES) return `${file.name} is larger than 15 MB.`;
    if (isVideo && file.size > MAX_VIDEO_BYTES) return `${file.name} is larger than 250 MB.`;
  }

  return null;
}

function safeFileName(name: string) {
  const lastDot = name.lastIndexOf(".");
  const extension = lastDot >= 0 ? name.slice(lastDot).toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
  const base = (lastDot >= 0 ? name.slice(0, lastDot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "attachment"}${extension}`;
}

function resumableEndpoint(supabaseUrl: string) {
  const url = new URL(supabaseUrl);
  if (url.hostname.endsWith(".supabase.co") && !url.hostname.endsWith(".storage.supabase.co")) {
    url.hostname = url.hostname.replace(".supabase.co", ".storage.supabase.co");
  }
  return `${url.origin}/storage/v1/upload/resumable`;
}

async function resumableUpload(
  file: File,
  storagePath: string,
  accessToken: string,
  onProgress: (percent: number) => void,
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: resumableEndpoint(supabaseUrl),
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-upsert": "false",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: "enquiry-files",
        objectName: storagePath,
        contentType: file.type,
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      onError: reject,
      onProgress: (uploaded, total) => onProgress(Math.round((uploaded / total) * 100)),
      onSuccess: () => resolve(),
    });

    void upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length > 0) upload.resumeFromPreviousUpload(previousUploads[0]);
      upload.start();
    }).catch(reject);
  });
}

export async function uploadEnquiryFiles(
  files: File[],
  enquiryId: string,
  onProgress: (progress: UploadProgress) => void,
) {
  const validationError = validateEnquiryFiles(files);
  if (validationError) throw new Error(validationError);
  if (files.length === 0) return;

  const supabase = createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) throw new Error("Your session expired. Sign in and try again.");

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const storagePath = `${session.user.id}/${enquiryId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const report = (percent: number) => onProgress({
      current: index + 1,
      total: files.length,
      fileName: file.name,
      percent,
    });

    report(0);
    if (file.size > 6 * 1024 * 1024) {
      await resumableUpload(file, storagePath, session.access_token, report);
    } else {
      const { error: uploadError } = await supabase.storage
        .from("enquiry-files")
        .upload(storagePath, file, { contentType: file.type, cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      report(100);
    }

    const { error: recordError } = await supabase.from("enquiry_files").insert({
      enquiry_id: enquiryId,
      customer_id: session.user.id,
      file_name: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
      file_type: file.type.startsWith("video/") ? "video" : "image",
    });

    if (recordError) {
      await supabase.storage.from("enquiry-files").remove([storagePath]);
      throw recordError;
    }
  }
}

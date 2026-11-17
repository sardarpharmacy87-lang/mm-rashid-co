export async function prepareProductImages(
  form: FormData,
  upload: (file: File) => Promise<string>,
) {
  const existing = [
    ...new Set(
      String(form.get("imageUrls") || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
  const files = form
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (existing.length + files.length > 5)
    throw new Error("A product can have a maximum of five images in total.");
  // Validate the complete selection before uploading anything.
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024)
      throw new Error(file.name + " must be 5 MB or smaller.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      throw new Error("Use JPG, PNG or WebP product images.");
  }
  const urls = [...existing];
  for (const file of files) urls.push(await upload(file));
  form.delete("images");
  form.set("imageUrls", [...new Set(urls)].join("\n"));
  return form;
}

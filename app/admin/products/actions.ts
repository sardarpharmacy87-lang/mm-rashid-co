"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function parseSpecifications(value: string) {
  const result: Record<string, string> = {};
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const separator = line.indexOf(":");
      if (separator < 1) return;
      const key = line.slice(0, separator).trim();
      const val = line.slice(separator + 1).trim();
      if (key && val) result[key] = val;
    });
  return result;
}

function parseVariants(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const label = line.split("|")[0].trim();
      if (!label) return null;
      return {
        label,
        price_pkr: null,
        price_usd: null,
        sort_order: index,
        active: true,
      };
    })
    .filter(Boolean) as Array<{
      label: string;
      price_pkr: null;
      price_usd: null;
      sort_order: number;
      active: boolean;
    }>;
}

function storagePathFromUrl(url: string) {
  const marker = "/storage/v1/object/public/product-images/";
  const index = url.indexOf(marker);
  if (index < 0) return null;
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

async function removeManagedImages(urls: string[]) {
  const paths = Array.from(
    new Set(urls.map(storagePathFromUrl).filter((value): value is string => Boolean(value))),
  );
  if (!paths.length) return;

  const supabase = await createClient();
  await supabase.storage.from("product-images").remove(paths);
}

async function collectImages(formData: FormData, existing: string[]) {
  const supabase = await createClient();
  const urls = Array.from(new Set(existing.filter(Boolean)));
  const files = formData
    .getAll("images")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (urls.length + files.length > 5) {
    throw new Error("A product can have a maximum of five images in total.");
  }

  for (const entry of files) {
    if (!(entry instanceof File) || entry.size === 0) continue;
    if (entry.size > 5 * 1024 * 1024) throw new Error("Each image must be 5MB or smaller.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(entry.type)) {
      throw new Error("Product images must be JPG, PNG or WebP.");
    }

    const extension =
      entry.type === "image/png" ? "png" : entry.type === "image/webp" ? "webp" : "jpg";
    const path = "catalogue/" + Date.now() + "-" + crypto.randomUUID() + "." + extension;

    const { error } = await supabase.storage.from("product-images").upload(path, entry, {
      cacheControl: "31536000",
      contentType: entry.type,
      upsert: false,
    });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return Array.from(new Set(urls)).slice(0, 5);
}

function productPayload(formData: FormData, images: string[]) {
  const name = textValue(formData, "name");
  const requestedSlug = textValue(formData, "slug");

  return {
    name,
    slug: slugify(requestedSlug || name),
    sku: textValue(formData, "sku") || null,
    product_group_id: textValue(formData, "productGroupId") || null,
    short_description: textValue(formData, "shortDescription") || null,
    description: textValue(formData, "description") || null,
    primary_image: images[0] || null,
    images,
    specifications: parseSpecifications(textValue(formData, "specifications")),
    price_pkr: null,
    price_usd: null,
    previous_price_pkr: null,
    previous_price_usd: null,
    price_on_request: true,
    stock_status: textValue(formData, "stockStatus") || "made_to_order",
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    sort_order: Number(textValue(formData, "sortOrder")) || 0,
    updated_at: new Date().toISOString(),
  };
}

export async function createProductGroup(formData: FormData) {
  await requireAdmin();

  const name = textValue(formData, "groupName");
  const slug = slugify(textValue(formData, "groupSlug") || name);
  const sortOrder = Number(textValue(formData, "groupSortOrder")) || 0;

  if (!name || !slug) {
    redirect("/admin/products?error=" + encodeURIComponent("Name is required"));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("product_groups").insert({
    name,
    slug,
    sort_order: sortOrder,
    active: true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect("/admin/products?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products?message=" + encodeURIComponent(name + " added"));
}

export async function deleteProductGroup(formData: FormData) {
  await requireAdmin();

  const groupId = textValue(formData, "groupId");
  if (!groupId) redirect("/admin/products?error=" + encodeURIComponent("Item not found"));

  const supabase = await createClient();
  const { error } = await supabase.from("product_groups").delete().eq("id", groupId);

  if (error) {
    redirect("/admin/products?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products?message=" + encodeURIComponent("Name removed"));
}

export async function createProduct(formData: FormData) {
  await requireAdmin();

  try {
    const imagesFromText = textValue(formData, "imageUrls")
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
    const images = await collectImages(formData, imagesFromText);
    const payload = productPayload(formData, images);

    if (!payload.name || !payload.slug) {
      redirect("/admin/products?error=" + encodeURIComponent("Product name is required"));
    }

    const supabase = await createClient();
    const { data: product, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id")
      .single();

    if (error || !product) {
      redirect("/admin/products?error=" + encodeURIComponent(error?.message ?? "Unable to add product"));
    }

    const variants = parseVariants(textValue(formData, "variants"));
    if (variants.length) {
      const { error: variantError } = await supabase
        .from("product_variants")
        .insert(variants.map((variant) => ({ ...variant, product_id: product.id })));
      if (variantError) {
        redirect("/admin/products?error=" + encodeURIComponent(variantError.message));
      }
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    redirect("/admin/products?message=" + encodeURIComponent("Product added"));
  } catch (error) {
    redirect(
      "/admin/products?error=" +
        encodeURIComponent(error instanceof Error ? error.message : "Unable to add product"),
    );
  }
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const productId = textValue(formData, "productId");
  if (!productId) redirect("/admin/products?error=Product%20not%20found");

  try {
    const existingImages = textValue(formData, "imageUrls")
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
    const supabase = await createClient();
    const { data: currentProduct } = await supabase
      .from("products")
      .select("images")
      .eq("id", productId)
      .maybeSingle();

    const previousImages = (currentProduct?.images ?? []) as string[];
    const images = await collectImages(formData, existingImages);
    const payload = productPayload(formData, images);

    const { error } = await supabase.from("products").update(payload).eq("id", productId);
    if (error) {
      redirect("/admin/products/" + productId + "?error=" + encodeURIComponent(error.message));
    }

    const variants = parseVariants(textValue(formData, "variants"));
    await supabase.from("product_variants").delete().eq("product_id", productId);
    if (variants.length) {
      const { error: variantError } = await supabase
        .from("product_variants")
        .insert(variants.map((variant) => ({ ...variant, product_id: productId })));
      if (variantError) {
        redirect("/admin/products/" + productId + "?error=" + encodeURIComponent(variantError.message));
      }
    }

    const removedImages = previousImages.filter((url) => !images.includes(url));
    await removeManagedImages(removedImages);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath("/products/" + payload.slug);
    redirect("/admin/products/" + productId + "?message=" + encodeURIComponent("Product updated"));
  } catch (error) {
    redirect(
      "/admin/products/" +
        productId +
        "?error=" +
        encodeURIComponent(error instanceof Error ? error.message : "Unable to update product"),
    );
  }
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const productId = textValue(formData, "productId");
  if (!productId) redirect("/admin/products?error=Product%20not%20found");

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("images")
    .eq("id", productId)
    .maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) redirect("/admin/products?error=" + encodeURIComponent(error.message));

  await removeManagedImages(((product?.images ?? []) as string[]));

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products?message=" + encodeURIComponent("Product deleted"));
}

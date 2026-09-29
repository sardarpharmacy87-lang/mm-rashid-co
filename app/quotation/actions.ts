"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { customRequestSchema } from "@/lib/quotation-rules";
export async function createCustomRequest(form: FormData) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return { error: "Please sign in again before submitting.", id: "" };
  let items: unknown = [];
  try {
    items = JSON.parse(String(form.get("items") || "[]"));
  } catch {
    return { error: "Your selected products could not be read.", id: "" };
  }
  const parsed = customRequestSchema.safeParse({
    ...Object.fromEntries(form),
    items,
  });
  if (!parsed.success)
    return {
      error:
        parsed.error.issues[0]?.message || "Please check your requirements.",
      id: "",
    };
  const d = parsed.data;
  const ids = Array.from(
    new Set([
      ...d.items.map((i) => i.id),
      ...(d.product_id ? [d.product_id] : []),
    ]),
  );
  const { data: products, error } = ids.length
    ? await db
        .from("products")
        .select("id,name,slug")
        .eq("active", true)
        .in("id", ids)
    : { data: [], error: null };
  if (error || products?.length !== ids.length)
    return {
      error:
        "A selected product is no longer available. Please refresh your selection.",
      id: "",
    };
  const selections = d.items.map((i) => ({
    ...i,
    name: products!.find((p) => p.id === i.id)!.name,
  }));
  const quantity = selections.length
    ? selections.reduce((n, i) => n + i.quantity, 0)
    : d.quantity;
  if (quantity > 100000)
    return {
      error: "For more than 100,000 pieces, please contact the workshop.",
      id: "",
    };
  const description = [
    d.description,
    ...selections.map(
      (i) =>
        `${i.name}: ${i.quantity} pieces; size ${i.size || "to discuss"}; color ${i.color || "to discuss"}`,
    ),
    d.product_id
      ? "Reference product: " +
        products!.find((p) => p.id === d.product_id)!.name
      : "",
    d.color && "Color / thread colors: " + d.color,
    d.size && "Size: " + d.size,
    d.measurements && `Measurements (${d.units}): ${d.measurements}`,
    d.material && "Material: " + d.material,
    d.finish && "Finish: " + d.finish,
    d.branding && "Embroidery / lettering: " + d.branding,
  ]
    .filter(Boolean)
    .join("\n");
  const { data: request, error: saveError } = await db
    .from("enquiries")
    .insert({
      customer_id: user.id,
      title: d.title,
      category: d.category,
      quantity,
      delivery_country: d.country,
      required_by: d.required_by || null,
      description,
      status: "submitted",
      uploads_complete: false,
      requirements: {
        color: d.color,
        size: d.size,
        measurements: d.measurements,
        units: d.units,
        material: d.material,
        finish: d.finish,
        branding: d.branding,
        product_id: d.product_id || null,
        items: selections,
        expected_files: d.file_count,
      },
    })
    .select("id")
    .single();
  return saveError
    ? { error: "Your request could not be saved. Please try again.", id: "" }
    : { error: "", id: request.id };
}
export async function finishCustomRequest(id: string, fileCount: number) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { error: "Please sign in again." };
  const { error } = await db.rpc("finish_custom_request", {
    p_id: id,
    p_file_count: fileCount,
  });
  if (error)
    return {
      error: "Please finish uploading your reference files, then try again.",
    };
  revalidatePath("/customer");
  revalidatePath("/admin/enquiries");
  return { error: "" };
}

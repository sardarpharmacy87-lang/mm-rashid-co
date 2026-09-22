"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { sendCustomerEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { enquirySchema, firstError } from "@/lib/validation";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function createEnquiry(formData: FormData) {
  const user = await requireUser();
  const parsed = enquirySchema.safeParse({
    title: value(formData, "title"),
    category: value(formData, "category"),
    description: value(formData, "description"),
    quantity: value(formData, "quantity"),
    deliveryCountry: value(formData, "deliveryCountry"),
    requiredBy: value(formData, "requiredBy") || undefined,
  });

  if (!parsed.success) {
    return { error: firstError(parsed.error) };
  }

  const supabase = await createClient();
  const { data: enquiry, error } = await supabase
    .from("enquiries")
    .insert({
      customer_id: user.id,
      title: parsed.data.title,
      category: parsed.data.category,
      description: parsed.data.description,
      quantity: parsed.data.quantity,
      delivery_country: parsed.data.deliveryCountry,
      required_by: parsed.data.requiredBy || null,
    })
    .select("id, enquiry_number")
    .single();

  if (error || !enquiry) {
    return { error: error?.message ?? "Unable to submit enquiry" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, company_name")
    .eq("id", user.id)
    .single();

  if (profile) {
    await sendCustomerEmail({
      to: profile.email,
      name: profile.full_name,
      subject: `Enquiry received — ${enquiry.enquiry_number}`,
      heading: "We have received your enquiry",
      message: `Your enquiry ${enquiry.enquiry_number} is now awaiting review. We will notify you by email when a price is ready.`,
      actionLabel: "View enquiry",
      actionPath: `/customer/enquiries/${enquiry.id}`,
      idempotencyKey: `enquiry-customer-${enquiry.id}`,
    });

    if (process.env.ADMIN_EMAIL) {
      await sendCustomerEmail({
        to: process.env.ADMIN_EMAIL,
        name: "MM Rashid Admin",
        subject: `New customer enquiry — ${enquiry.enquiry_number}`,
        heading: "A new enquiry needs review",
        message: `${profile.full_name} from ${profile.company_name} submitted enquiry ${enquiry.enquiry_number}: ${parsed.data.title}.`,
        actionLabel: "Review enquiry",
        actionPath: `/admin/enquiries/${enquiry.id}`,
        idempotencyKey: `enquiry-admin-${enquiry.id}`,
      });
    }
  }

  revalidatePath("/customer");
  return {
    enquiryId: enquiry.id,
    enquiryNumber: enquiry.enquiry_number,
  };
}

export async function acceptQuotation(formData: FormData) {
  const user = await requireUser();
  const quotationId = value(formData, "quotationId");
  const supabase = await createClient();
  const { data: quotation } = await supabase
    .from("quotations")
    .select("quotation_number, enquiry_id, currency, total")
    .eq("id", quotationId)
    .eq("customer_id", user.id)
    .single();

  if (!quotation) redirect("/customer?error=Quotation not found");

  const { error } = await supabase.rpc("accept_quotation", { p_quotation_id: quotationId });
  if (error) redirect(`/customer/enquiries/${quotation.enquiry_id}?error=${encodeURIComponent(error.message)}`);

  const { data: customer } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  if (customer) {
    await sendCustomerEmail({
      to: customer.email,
      name: customer.full_name,
      subject: `Order created from ${quotation.quotation_number}`,
      heading: "Your order has been created",
      message: `You accepted ${quotation.quotation_number} for ${quotation.currency} ${Number(quotation.total).toFixed(2)}. Your new order is now visible in the customer dashboard.`,
      actionLabel: "View order dashboard",
      actionPath: "/customer",
      idempotencyKey: `quote-accepted-customer-${quotationId}`,
    });
  }

  if (process.env.ADMIN_EMAIL) {
    await sendCustomerEmail({
      to: process.env.ADMIN_EMAIL,
      name: "MM Rashid Admin",
      subject: `Quotation accepted — ${quotation.quotation_number}`,
      heading: "Customer accepted a quotation",
      message: `${quotation.quotation_number} has been accepted. An order record was created automatically.`,
      actionLabel: "Open admin portal",
      actionPath: "/admin",
      idempotencyKey: `quote-accepted-admin-${quotationId}`,
    });
  }

  revalidatePath("/customer");
  redirect(`/customer/enquiries/${quotation.enquiry_id}?message=Quotation accepted and order created`);
}

export async function rejectQuotation(formData: FormData) {
  const user = await requireUser();
  const quotationId = value(formData, "quotationId");
  const supabase = await createClient();
  const { data: quotation } = await supabase
    .from("quotations")
    .select("quotation_number, enquiry_id")
    .eq("id", quotationId)
    .eq("customer_id", user.id)
    .single();

  if (!quotation) redirect("/customer?error=Quotation not found");
  const { error } = await supabase.rpc("reject_quotation", { p_quotation_id: quotationId });
  if (error) redirect(`/customer/enquiries/${quotation.enquiry_id}?error=${encodeURIComponent(error.message)}`);

  const { data: customer } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  if (customer) {
    await sendCustomerEmail({
      to: customer.email,
      name: customer.full_name,
      subject: `Quotation declined — ${quotation.quotation_number}`,
      heading: "Your response was recorded",
      message: `${quotation.quotation_number} has been marked as declined. Contact us if you would like a revised quotation.`,
      actionLabel: "View enquiry",
      actionPath: `/customer/enquiries/${quotation.enquiry_id}`,
      idempotencyKey: `quote-rejected-customer-${quotationId}`,
    });
  }

  if (process.env.ADMIN_EMAIL) {
    await sendCustomerEmail({
      to: process.env.ADMIN_EMAIL,
      name: "MM Rashid Admin",
      subject: `Quotation declined — ${quotation.quotation_number}`,
      heading: "Customer declined a quotation",
      message: `${quotation.quotation_number} was declined by the customer. Contact them if a revision is appropriate.`,
      actionLabel: "Review enquiry",
      actionPath: `/admin/enquiries/${quotation.enquiry_id}`,
      idempotencyKey: `quote-rejected-admin-${quotationId}`,
    });
  }

  revalidatePath("/customer");
  redirect(`/customer/enquiries/${quotation.enquiry_id}?message=Quotation declined`);
}

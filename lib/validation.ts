import { z } from "zod";

const requiredText = (label: string, minimum = 2) =>
  z.string().trim().min(minimum, `${label} is required`).max(250);

export const signUpSchema = z
  .object({
    fullName: requiredText("Full name"),
    companyName: requiredText("Company or organisation"),
    customerType: z.enum(["individual", "company", "institution", "military", "fraternal"]),
    email: z.string().trim().email("Enter a valid email address").max(320),
    phone: requiredText("Phone number", 7).max(30),
    whatsapp: requiredText("WhatsApp number", 7).max(30),
    country: requiredText("Country"),
    city: requiredText("City"),
    address: requiredText("Full address", 5).max(500),
    postalCode: requiredText("Postal code", 2).max(30),
    password: z.string().min(8, "Password must contain at least 8 characters").max(72),
    confirmPassword: z.string(),
    terms: z.literal("on", { error: "You must accept the terms" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const enquirySchema = z.object({
  title: requiredText("Enquiry title", 3),
  category: z.enum(["goldwork", "military", "regalia", "crest", "cap-visor", "fez", "other"]),
  description: requiredText("Description", 20).max(5000),
  quantity: z.coerce.number().int().min(1).max(1000000),
  deliveryCountry: requiredText("Delivery country"),
  requiredBy: z.string().optional(),
});

export const quotationSchema = z.object({
  enquiryId: z.string().uuid(),
  currency: z.enum(["USD", "GBP", "EUR", "PKR", "AED"]),
  subtotal: z.coerce.number().min(0),
  shipping: z.coerce.number().min(0),
  tax: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  validUntil: z.string().min(1, "Valid-until date is required"),
  notes: z.string().trim().max(5000).optional(),
});

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "pending",
    "confirmed",
    "in_production",
    "quality_check",
    "ready",
    "dispatched",
    "delivered",
    "cancelled",
  ]),
  trackingNumber: z.string().trim().max(120).optional(),
  note: z.string().trim().max(1000).optional(),
});

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the submitted information";
}

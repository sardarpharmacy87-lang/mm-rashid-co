import { z } from "zod";
export const requestItemSchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().min(1).max(100000),
  size: z.string().max(80).default(""),
  color: z.string().max(80).default(""),
});
export const customRequestSchema = z.object({
  title: z.string().trim().min(3).max(200),
  category: z.enum([
    "goldwork",
    "military",
    "regalia",
    "crest",
    "cap-visor",
    "fez",
    "other",
  ]),
  quantity: z.coerce.number().int().min(1).max(100000),
  color: z.string().trim().max(200),
  size: z.string().trim().max(200),
  material: z.string().trim().max(200),
  finish: z.string().trim().max(200),
  branding: z.string().trim().max(500),
  measurements: z.string().trim().max(1000),
  units: z.enum(["cm", "inches", "mm"]),
  description: z.string().trim().min(10).max(4000),
  country: z.string().trim().min(2).max(100),
  required_by: z
    .string()
    .refine(
      (v) =>
        !v ||
        (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
          !Number.isNaN(Date.parse(v)) &&
          v >= new Date().toISOString().slice(0, 10)),
      "Choose today or a future date.",
    ),
  file_count: z.coerce.number().int().min(0).max(10),
  terms: z.literal("on"),
  product_id: z.union([z.string().uuid(), z.literal("")]),
  items: z.array(requestItemSchema).max(30),
});

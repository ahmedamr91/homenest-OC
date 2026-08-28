import { z } from "zod";

export const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export const colorSchema = z.object({
  name: z.string().trim().min(1).max(50),
  hex: z.string().trim().regex(HEX_RE, "Invalid color hex"),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(5000),
  additionalInfo: z.string().trim().max(5000).nullable().optional().or(z.literal("").transform(() => null)),
  shippingPolicy: z.string().trim().max(3000).nullable().optional().or(z.literal("").transform(() => null)),
  specifications: z.string().trim().max(5000).nullable().optional().or(z.literal("").transform(() => null)),
  price: z.number().positive().max(10000000),
  comparePrice: z.number().positive().max(10000000).nullable().optional(),
  stock: z.number().int().min(0).max(1000000),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  returnDays: z.number().int().min(0).max(365).nullable().optional(),
  imageUrl: z
    .string()
    .trim()
    .url()
    .max(1000)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
  categoryId: z.number().int().positive(),
  colors: z.array(colorSchema).max(12).default([]),
  images: z
    .array(
      z.union([
        z.string().trim().url().max(1000).transform((v) => ({ url: v, colorHex: null as string | null })),
        z.object({
          url: z.string().trim().url().max(1000),
          colorHex: z
            .string()
            .trim()
            .regex(HEX_RE, "Invalid color hex")
            .nullable()
            .optional()
            .or(z.literal("").transform(() => null))
            .transform((v) => (v as string | null) ?? null),
        }),
      ])
    )
    .max(8)
    .default([]),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).nullable().optional(),
  imageUrl: z
    .string()
    .trim()
    .url()
    .max(1000)
    .nullable()
    .optional()
    .or(z.literal("").transform(() => null)),
});

export const categoryUpdateSchema = categorySchema.partial();

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30).regex(/^[+0-9\s()-]+$/, "Invalid phone"),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  notes: z.string().trim().max(1000).nullable().optional(),
  discountCode: z.string().trim().max(40).nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        colorId: z.number().int().positive().nullable().optional(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1)
    .max(50),
});

export const reviewSchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().trim().min(2).max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).nullable().optional(),
});

export const discountCreateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, - and _ only")
    .transform((s) => s.toUpperCase()),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive().max(1000000),
  minOrder: z.number().min(0).nullable().optional(),
  maxUses: z.number().int().positive().max(1000000).nullable().optional(),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export const discountToggleSchema = z.object({ active: z.boolean() });

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const customRequestSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30).regex(/^[+0-9\s()-]+$/, "Invalid phone"),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(3000),
  budget: z.number().positive().max(1000000).nullable().optional(),
  colors: z.array(z.string().trim().regex(HEX_RE, "Invalid color")).min(1).max(6),
});

export const customStatusSchema = z.object({
  status: z.enum(["NEW", "REVIEWING", "QUOTED", "IN_PRODUCTION", "COMPLETED", "REJECTED"]),
});

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // under Vercel's serverless body limit

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

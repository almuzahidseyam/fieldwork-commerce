import { z } from "zod";
export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const cartSchema = z
  .object({
    productSlug: slugSchema,
    quantity: z.number().int().min(1).max(99),
  })
  .strict();
export const quantitySchema = z
  .object({ quantity: z.number().int().min(1).max(99) })
  .strict();
export const wishlistSchema = z.object({ productSlug: slugSchema }).strict();
export const profileSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.email().trim().max(254),
  })
  .strict();
export const filtersSchema = z
  .object({
    search: z.string().max(100).optional(),
    category: slugSchema.optional(),
    sort: z.enum(["featured", "price-asc", "price-desc", "name"]).optional(),
    maxPrice: z.coerce.number().int().min(0).max(10000000).optional(),
    inStock: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
  })
  .strict();

import { z } from 'zod';
import { PRODUCT_STATUS, GENDER } from '../constants/index.js';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(160),
  sku: z.string().min(1),
  shortDescription: z.string().max(300).optional(),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  discountPrice: z.number().nonnegative().optional(),
  brand: objectId,
  category: objectId,
  subcategory: objectId.optional(),
  gender: z.enum(Object.values(GENDER)).optional(),
  thumbnail: imageSchema.optional(),
  gallery: z.array(imageSchema).optional(),
  specifications: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  variants: z
    .array(
      z.object({
        name: z.string(),
        sku: z.string(),
        attributes: z.record(z.string()).optional(),
        price: z.number().optional(),
        discountPrice: z.number().optional(),
        stock: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
  stock: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  weight: z.number().optional(),
  warranty: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  status: z.enum(Object.values(PRODUCT_STATUS)).optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      metaKeywords: z.array(z.string()).optional(),
    })
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

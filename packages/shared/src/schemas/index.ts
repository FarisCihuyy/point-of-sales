import { z } from "zod";

// Stores / Outlets
export const BusinessModeSchema = z.enum(["retail", "resto"]);

export const StoreSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nama outlet wajib diisi"),
  businessMode: BusinessModeSchema.default("retail"),
  address: z.string().optional().nullable(),
  taxRate: z.number().min(0).max(100).default(0),
  serviceChargeRate: z.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
});

export const CreateStoreSchema = StoreSchema.omit({ id: true, createdAt: true });
export const UpdateStoreSchema = CreateStoreSchema.partial();

// Users / Staff
export const UserRoleSchema = z.enum(["owner", "manager", "cashier", "waitstaff"]);

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  storeId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid"),
  role: UserRoleSchema.default("cashier"),
  pin: z.string().regex(/^\d{4,6}$/, "PIN harus 4-6 digit angka").optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
});

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true }).extend({
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
});
export const UpdateUserSchema = CreateUserSchema.partial();

// Categories
export const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nama kategori wajib diisi"),
  createdAt: z.date().optional(),
});

export const CreateCategorySchema = CategorySchema.omit({ id: true, createdAt: true });
export const UpdateCategorySchema = CreateCategorySchema.partial();

// Products & Variants
export const ProductVariantSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  name: z.string().min(1, "Nama varian wajib diisi"),
  priceAdjustment: z.number().default(0),
  sku: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Nama produk wajib diisi"),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  basePrice: z.number().min(0, "Harga dasar minimal 0"),
  costPrice: z.number().min(0, "Harga modal minimal 0").default(0),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  variants: z.array(ProductVariantSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateProductSchema = ProductSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateProductSchema = CreateProductSchema.partial();

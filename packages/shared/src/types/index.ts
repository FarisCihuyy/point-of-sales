import type { z } from "zod";
import type {
  BusinessModeSchema,
  StoreSchema,
  CreateStoreSchema,
  UpdateStoreSchema,
  UserRoleSchema,
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  CategorySchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  ProductSchema,
  ProductVariantSchema,
  CreateProductSchema,
  UpdateProductSchema,
} from "../schemas";

export type BusinessMode = z.infer<typeof BusinessModeSchema>;
export type Store = z.infer<typeof StoreSchema>;
export type CreateStoreInput = z.infer<typeof CreateStoreSchema>;
export type UpdateStoreInput = z.infer<typeof UpdateStoreSchema>;

export type UserRole = z.infer<typeof UserRoleSchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

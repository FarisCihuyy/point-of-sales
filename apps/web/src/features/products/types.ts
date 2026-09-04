import type {
  Product,
  CreateProductInput,
  Category,
  ProductVariant,
} from "@repo/shared";

export type { Product, CreateProductInput, Category, ProductVariant };

export type ProductWithDetails = Product & {
  category?: Category | null;
  variants?: ProductVariant[];
};

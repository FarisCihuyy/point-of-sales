import { t } from "elysia";

export const ProductVariantModel = t.Object({
  id: t.Optional(t.String()),
  name: t.String({ minLength: 1, error: "Nama varian wajib diisi" }),
  priceAdjustment: t.Optional(t.Number()),
  sku: t.Optional(t.Nullable(t.String())),
  isActive: t.Optional(t.Boolean()),
});

export const ProductModel = {
  variant: ProductVariantModel,

  create: t.Object({
    name: t.String({ minLength: 1, error: "Nama produk wajib diisi" }),
    categoryId: t.Optional(t.Nullable(t.String())),
    sku: t.Optional(t.Nullable(t.String())),
    barcode: t.Optional(t.Nullable(t.String())),
    basePrice: t.Number({ minimum: 0 }),
    costPrice: t.Optional(t.Number({ minimum: 0 })),
    imageUrl: t.Optional(t.Nullable(t.String())),
    isActive: t.Optional(t.Boolean()),
    variants: t.Optional(t.Array(ProductVariantModel)),
  }),

  update: t.Object({
    name: t.Optional(t.String({ minLength: 1 })),
    categoryId: t.Optional(t.Nullable(t.String())),
    sku: t.Optional(t.Nullable(t.String())),
    barcode: t.Optional(t.Nullable(t.String())),
    basePrice: t.Optional(t.Number({ minimum: 0 })),
    costPrice: t.Optional(t.Number({ minimum: 0 })),
    imageUrl: t.Optional(t.Nullable(t.String())),
    isActive: t.Optional(t.Boolean()),
    variants: t.Optional(t.Array(ProductVariantModel)),
  }),

  params: t.Object({
    id: t.String({ error: "Product ID is required" }),
  }),
};

export type CreateProductBody = typeof ProductModel.create.static;
export type UpdateProductBody = typeof ProductModel.update.static;

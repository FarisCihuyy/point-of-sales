import { t } from "elysia";

export const CategoryModel = {
  category: t.Object({
    id: t.String(),
    name: t.String(),
    createdAt: t.Date(),
  }),

  create: t.Object({
    name: t.String({ minLength: 1, error: "Nama kategori wajib diisi" }),
  }),

  update: t.Object({
    name: t.String({ minLength: 1, error: "Nama kategori wajib diisi" }),
  }),

  params: t.Object({
    id: t.String({ error: "Category ID is required" }),
  }),
};

export type CategoryType = typeof CategoryModel.category.static;
export type CreateCategoryBody = typeof CategoryModel.create.static;
export type UpdateCategoryBody = typeof CategoryModel.update.static;

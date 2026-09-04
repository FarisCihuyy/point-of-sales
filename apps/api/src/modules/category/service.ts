import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "../../db";
import { categories } from "../../db/schema/template";
import type { CreateCategoryBody, UpdateCategoryBody } from "./model";

export class CategoryService {
  static async getAll() {
    return await db.select().from(categories);
  }

  static async getById(id: string) {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) {
      return status(404, { message: "Kategori tidak ditemukan" });
    }

    return category;
  }

  static async create(data: CreateCategoryBody) {
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: data.name,
      })
      .returning();

    if (!newCategory) {
      return status(500, { message: "Gagal membuat kategori" });
    }

    return status(201, newCategory);
  }

  static async update(id: string, data: UpdateCategoryBody) {
    const [updated] = await db
      .update(categories)
      .set({
        name: data.name,
      })
      .where(eq(categories.id, id))
      .returning();

    if (!updated) {
      return status(404, { message: "Kategori tidak ditemukan" });
    }

    return updated;
  }

  static async delete(id: string) {
    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!deleted) {
      return status(404, { message: "Kategori tidak ditemukan" });
    }

    return { success: true, id };
  }
}

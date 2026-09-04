import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { categories } from "../db/schema/template";

export const categoriesRoute = new Elysia({ prefix: "/categories" })
  .get("/", async () => {
    return await db.select().from(categories);
  })
  .get("/:id", async ({ params: { id }, status }) => {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    if (!category) return status(404, { message: "Kategori tidak ditemukan" });
    return category;
  }, {
    params: t.Object({ id: t.String() }),
  })
  .post("/", async ({ body, status }) => {
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: body.name,
      })
      .returning();
    return status(201, newCategory);
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
    }),
  })
  .put("/:id", async ({ params: { id }, body, status }) => {
    const [updated] = await db
      .update(categories)
      .set({
        name: body.name,
      })
      .where(eq(categories.id, id))
      .returning();
    if (!updated) return status(404, { message: "Kategori tidak ditemukan" });
    return updated;
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.String({ minLength: 1 }),
    }),
  })
  .delete("/:id", async ({ params: { id }, status }) => {
    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    if (!deleted) return status(404, { message: "Kategori tidak ditemukan" });
    return { success: true, id };
  }, {
    params: t.Object({ id: t.String() }),
  });

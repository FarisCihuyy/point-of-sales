import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { stores } from "../db/schema/template";

export const storesRoute = new Elysia({ prefix: "/stores" })
  .get("/", async () => {
    return await db.select().from(stores);
  })
  .get("/:id", async ({ params: { id }, status }) => {
    const [store] = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
    if (!store) return status(404, { message: "Outlet tidak ditemukan" });
    return store;
  }, {
    params: t.Object({ id: t.String() }),
  })
  .post("/", async ({ body, status }) => {
    const [newStore] = await db
      .insert(stores)
      .values({
        name: body.name,
        businessMode: body.businessMode ?? "retail",
        address: body.address ?? null,
        taxRate: body.taxRate ?? 0,
        serviceChargeRate: body.serviceChargeRate ?? 0,
        isActive: body.isActive ?? true,
      })
      .returning();
    return status(201, newStore);
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      businessMode: t.Optional(t.Union([t.Literal("retail"), t.Literal("resto")])),
      address: t.Optional(t.Nullable(t.String())),
      taxRate: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
      serviceChargeRate: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
      isActive: t.Optional(t.Boolean()),
    }),
  })
  .put("/:id", async ({ params: { id }, body, status }) => {
    const [updated] = await db
      .update(stores)
      .set({
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.businessMode !== undefined ? { businessMode: body.businessMode } : {}),
        ...(body.address !== undefined ? { address: body.address } : {}),
        ...(body.taxRate !== undefined ? { taxRate: body.taxRate } : {}),
        ...(body.serviceChargeRate !== undefined ? { serviceChargeRate: body.serviceChargeRate } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      })
      .where(eq(stores.id, id))
      .returning();
    if (!updated) return status(404, { message: "Outlet tidak ditemukan" });
    return updated;
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1 })),
      businessMode: t.Optional(t.Union([t.Literal("retail"), t.Literal("resto")])),
      address: t.Optional(t.Nullable(t.String())),
      taxRate: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
      serviceChargeRate: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
      isActive: t.Optional(t.Boolean()),
    }),
  })
  .delete("/:id", async ({ params: { id }, status }) => {
    const [deleted] = await db
      .delete(stores)
      .where(eq(stores.id, id))
      .returning();
    if (!deleted) return status(404, { message: "Outlet tidak ditemukan" });
    return { success: true, id };
  }, {
    params: t.Object({ id: t.String() }),
  });

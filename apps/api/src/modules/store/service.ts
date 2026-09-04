import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "../../db";
import { stores } from "../../db/schema/template";
import type { CreateStoreBody, UpdateStoreBody } from "./model";

export class StoreService {
  static async getAll() {
    return await db.select().from(stores);
  }

  static async getById(id: string) {
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, id))
      .limit(1);

    if (!store) {
      return status(404, { message: "Outlet tidak ditemukan" });
    }

    return store;
  }

  static async create(data: CreateStoreBody) {
    const [newStore] = await db
      .insert(stores)
      .values({
        name: data.name,
        businessMode: data.businessMode ?? "retail",
        address: data.address ?? null,
        taxRate: data.taxRate ?? 0,
        serviceChargeRate: data.serviceChargeRate ?? 0,
        isActive: data.isActive ?? true,
      })
      .returning();

    if (!newStore) {
      return status(500, { message: "Gagal membuat outlet" });
    }

    return status(201, newStore);
  }

  static async update(id: string, data: UpdateStoreBody) {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.businessMode !== undefined) updates.businessMode = data.businessMode;
    if (data.address !== undefined) updates.address = data.address;
    if (data.taxRate !== undefined) updates.taxRate = data.taxRate;
    if (data.serviceChargeRate !== undefined)
      updates.serviceChargeRate = data.serviceChargeRate;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    const [updated] = await db
      .update(stores)
      .set(updates)
      .where(eq(stores.id, id))
      .returning();

    if (!updated) {
      return status(404, { message: "Outlet tidak ditemukan" });
    }

    return updated;
  }

  static async delete(id: string) {
    const [deleted] = await db
      .delete(stores)
      .where(eq(stores.id, id))
      .returning();

    if (!deleted) {
      return status(404, { message: "Outlet tidak ditemukan" });
    }

    return { success: true, id };
  }
}

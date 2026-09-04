import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "../../db";
import { users } from "../../db/schema/template";
import type { CreateUserBody, UpdateUserBody } from "./model";

export class UserService {
  static async getAll() {
    return await db
      .select({
        id: users.id,
        storeId: users.storeId,
        name: users.name,
        email: users.email,
        role: users.role,
        pin: users.pin,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users);
  }

  static async getById(id: string) {
    const [user] = await db
      .select({
        id: users.id,
        storeId: users.storeId,
        name: users.name,
        email: users.email,
        role: users.role,
        pin: users.pin,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return status(404, { message: "Karyawan tidak ditemukan" });
    }

    return user;
  }

  static async create(data: CreateUserBody) {
    const passwordHash = data.password
      ? Bun.password.hashSync(data.password)
      : "default_hash";

    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        storeId: data.storeId ?? null,
        role: data.role ?? "cashier",
        pin: data.pin ?? null,
        passwordHash,
        isActive: data.isActive ?? true,
      })
      .returning({
        id: users.id,
        storeId: users.storeId,
        name: users.name,
        email: users.email,
        role: users.role,
        pin: users.pin,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    if (!newUser) {
      return status(500, { message: "Gagal membuat karyawan" });
    }

    return status(201, newUser);
  }

  static async update(id: string, data: UpdateUserBody) {
    const updates: Record<string, unknown> = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.email !== undefined) updates.email = data.email;
    if (data.storeId !== undefined) updates.storeId = data.storeId;
    if (data.role !== undefined) updates.role = data.role;
    if (data.pin !== undefined) updates.pin = data.pin;
    if (data.isActive !== undefined) updates.isActive = data.isActive;
    if (data.password)
      updates.passwordHash = Bun.password.hashSync(data.password);

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        storeId: users.storeId,
        name: users.name,
        email: users.email,
        role: users.role,
        pin: users.pin,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    if (!updated) {
      return status(404, { message: "Karyawan tidak ditemukan" });
    }

    return updated;
  }

  static async delete(id: string) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deleted) {
      return status(404, { message: "Karyawan tidak ditemukan" });
    }

    return { success: true, id };
  }
}

import { eq } from "drizzle-orm";
import { status } from "elysia";
import { db } from "../../db";
import { users } from "../../db/schema/template";
import type { CreateUserBody, UpdateUserBody } from "./model";

export class UserService {
  private static userSelectFields = {
    id: users.id,
    storeId: users.storeId,
    name: users.name,
    email: users.email,
    role: users.role,
    isActive: users.isActive,
    createdAt: users.createdAt,
  };

  static async hashSecret(secret: string): Promise<string> {
    return await Bun.password.hash(secret, {
      algorithm: "argon2id",
      memoryCost: 65536,
      timeCost: 2,
    });
  }

  static async getAll() {
    return await db
      .select(this.userSelectFields)
      .from(users);
  }

  static async getById(id: string) {
    const [user] = await db
      .select(this.userSelectFields)
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
      ? await this.hashSecret(data.password)
      : await this.hashSecret("default_password_123");

    const pinHash = data.pin ? await this.hashSecret(data.pin) : null;

    const [newUser] = await db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        storeId: data.storeId ?? null,
        role: data.role ?? "cashier",
        pin: pinHash,
        passwordHash,
        isActive: data.isActive ?? true,
      })
      .returning(this.userSelectFields);

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
    if (data.isActive !== undefined) updates.isActive = data.isActive;
    
    if (data.pin !== undefined) {
      updates.pin = data.pin ? await this.hashSecret(data.pin) : null;
    }
    
    if (data.password) {
      updates.passwordHash = await this.hashSecret(data.password);
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning(this.userSelectFields);

    if (!updated) {
      return status(404, { message: "Karyawan tidak ditemukan" });
    }

    return updated;
  }

  static async delete(id: string) {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted) {
      return status(404, { message: "Karyawan tidak ditemukan" });
    }

    return { success: true, id };
  }
}

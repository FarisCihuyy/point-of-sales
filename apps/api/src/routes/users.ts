import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema/template";

export const usersRoute = new Elysia({ prefix: "/users" })
  .get("/", async () => {
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
  })
  .get("/:id", async ({ params: { id }, status }) => {
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
    if (!user) return status(404, { message: "Karyawan tidak ditemukan" });
    return user;
  }, {
    params: t.Object({ id: t.String() }),
  })
  .post("/", async ({ body, status }) => {
    // Password hash placeholder / basic hash
    const passwordHash = body.password ? Bun.password.hashSync(body.password) : "default_hash";

    const [newUser] = await db
      .insert(users)
      .values({
        name: body.name,
        email: body.email,
        storeId: body.storeId ?? null,
        role: body.role ?? "cashier",
        pin: body.pin ?? null,
        passwordHash,
        isActive: body.isActive ?? true,
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
    return status(201, newUser);
  }, {
    body: t.Object({
      name: t.String({ minLength: 1 }),
      email: t.String({ format: "email" }),
      password: t.Optional(t.String({ minLength: 6 })),
      storeId: t.Optional(t.Nullable(t.String())),
      role: t.Optional(t.Union([
        t.Literal("owner"),
        t.Literal("manager"),
        t.Literal("cashier"),
        t.Literal("waitstaff"),
      ])),
      pin: t.Optional(t.Nullable(t.String())),
      isActive: t.Optional(t.Boolean()),
    }),
  })
  .put("/:id", async ({ params: { id }, body, status }) => {
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.storeId !== undefined) updates.storeId = body.storeId;
    if (body.role !== undefined) updates.role = body.role;
    if (body.pin !== undefined) updates.pin = body.pin;
    if (body.isActive !== undefined) updates.isActive = body.isActive;
    if (body.password) updates.passwordHash = Bun.password.hashSync(body.password);

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
    if (!updated) return status(404, { message: "Karyawan tidak ditemukan" });
    return updated;
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1 })),
      email: t.Optional(t.String({ format: "email" })),
      password: t.Optional(t.String({ minLength: 6 })),
      storeId: t.Optional(t.Nullable(t.String())),
      role: t.Optional(t.Union([
        t.Literal("owner"),
        t.Literal("manager"),
        t.Literal("cashier"),
        t.Literal("waitstaff"),
      ])),
      pin: t.Optional(t.Nullable(t.String())),
      isActive: t.Optional(t.Boolean()),
    }),
  })
  .delete("/:id", async ({ params: { id }, status }) => {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    if (!deleted) return status(404, { message: "Karyawan tidak ditemukan" });
    return { success: true, id };
  }, {
    params: t.Object({ id: t.String() }),
  });

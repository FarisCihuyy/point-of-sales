import { t } from "elysia";

export const UserModel = {
  user: t.Object({
    id: t.String(),
    storeId: t.Nullable(t.String()),
    name: t.String(),
    email: t.String({ format: "email" }),
    role: t.Union([
      t.Literal("owner"),
      t.Literal("manager"),
      t.Literal("cashier"),
      t.Literal("waitstaff"),
    ]),
    pin: t.Nullable(t.String()),
    isActive: t.Boolean(),
    createdAt: t.Date(),
  }),

  create: t.Object({
    name: t.String({ minLength: 1, error: "Nama wajib diisi" }),
    email: t.String({ format: "email", error: "Format email tidak valid" }),
    password: t.Optional(t.String({ minLength: 6 })),
    storeId: t.Optional(t.Nullable(t.String())),
    role: t.Optional(
      t.Union([
        t.Literal("owner"),
        t.Literal("manager"),
        t.Literal("cashier"),
        t.Literal("waitstaff"),
      ])
    ),
    pin: t.Optional(t.Nullable(t.String())),
    isActive: t.Optional(t.Boolean()),
  }),

  update: t.Object({
    name: t.Optional(t.String({ minLength: 1 })),
    email: t.Optional(t.String({ format: "email" })),
    password: t.Optional(t.String({ minLength: 6 })),
    storeId: t.Optional(t.Nullable(t.String())),
    role: t.Optional(
      t.Union([
        t.Literal("owner"),
        t.Literal("manager"),
        t.Literal("cashier"),
        t.Literal("waitstaff"),
      ])
    ),
    pin: t.Optional(t.Nullable(t.String())),
    isActive: t.Optional(t.Boolean()),
  }),

  params: t.Object({
    id: t.String({ error: "User ID is required" }),
  }),
};

export type UserType = typeof UserModel.user.static;
export type CreateUserBody = typeof UserModel.create.static;
export type UpdateUserBody = typeof UserModel.update.static;

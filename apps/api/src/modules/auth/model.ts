import { t } from "elysia";

export const AuthModel = {
  loginEmail: t.Object({
    email: t.String({ format: "email", error: "Format email tidak valid" }),
    password: t.String({ minLength: 1, error: "Password wajib diisi" }),
  }),

  loginPin: t.Object({
    pin: t.String({ minLength: 4, maxLength: 6, error: "PIN harus 4-6 digit angka" }),
    storeId: t.Optional(t.String()),
  }),

  user: t.Object({
    id: t.String(),
    name: t.String(),
    email: t.String(),
    role: t.Union([
      t.Literal("owner"),
      t.Literal("manager"),
      t.Literal("cashier"),
      t.Literal("waitstaff"),
    ]),
    storeId: t.Nullable(t.String()),
  }),

  authResponse: t.Object({
    user: t.Object({
      id: t.String(),
      name: t.String(),
      email: t.String(),
      role: t.Union([
        t.Literal("owner"),
        t.Literal("manager"),
        t.Literal("cashier"),
        t.Literal("waitstaff"),
      ]),
      storeId: t.Nullable(t.String()),
    }),
    message: t.Optional(t.String()),
  }),
};

export type LoginEmailBody = typeof AuthModel.loginEmail.static;
export type LoginPinBody = typeof AuthModel.loginPin.static;
export type AuthUser = typeof AuthModel.user.static;

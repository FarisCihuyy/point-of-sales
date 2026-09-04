import { t } from "elysia";

export const AuthModel = {
  loginEmail: t.Object({
    email: t.String({ format: "email", error: "Format email tidak valid" }),
    password: t.String({ minLength: 1, error: "Password wajib diisi" }),
  }),

  loginPin: t.Object({
    pin: t.String({ minLength: 4, maxLength: 6, error: "PIN harus 4-6 digit" }),
    storeId: t.Optional(t.String()),
  }),

  authResponse: t.Object({
    user: t.Object({
      id: t.String(),
      name: t.String(),
      email: t.String(),
      role: t.String(),
      storeId: t.Nullable(t.String()),
    }),
    token: t.Optional(t.String()),
  }),
};

export type LoginEmailBody = typeof AuthModel.loginEmail.static;
export type LoginPinBody = typeof AuthModel.loginPin.static;

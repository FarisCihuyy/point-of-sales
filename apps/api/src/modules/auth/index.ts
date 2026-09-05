import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthModel } from "./model";
import { AuthService } from "./service";

const JWT_SECRET = process.env.JWT_SECRET || "pos_jwt_super_secret_key_change_in_prod";

export const authController = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
      exp: "7d",
    })
  )
  .model(AuthModel)
  .post(
    "/login",
    async ({ body, jwt, cookie, set }) => {
      const result = await AuthService.loginWithEmail(body);
      if ("user" in result) {
        const token = await jwt.sign({
          sub: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          storeId: result.user.storeId,
        });

        if (cookie.auth_token) {
          cookie.auth_token.set({
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
          });
        }

        return {
          user: result.user,
          message: "Login berhasil",
        };
      }
      return result;
    },
    {
      body: "loginEmail",
    }
  )
  .post(
    "/login-pin",
    async ({ body, jwt, cookie, set }) => {
      const result = await AuthService.loginWithPin(body);
      if ("user" in result) {
        const token = await jwt.sign({
          sub: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          storeId: result.user.storeId,
        });

        if (cookie.auth_token) {
          cookie.auth_token.set({
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
          });
        }

        return {
          user: result.user,
          message: "Login PIN berhasil",
        };
      }
      return result;
    },
    {
      body: "loginPin",
    }
  )
  .post("/logout", ({ cookie }) => {
    if (cookie.auth_token) {
      cookie.auth_token.remove();
    }
    return { success: true, message: "Logout berhasil" };
  })
  .get("/me", async ({ jwt, cookie, set }) => {
    const token = cookie.auth_token?.value;
    if (!token || typeof token !== "string") {
      set.status = 401;
      return { message: "Belum terautentikasi" };
    }

    const payload = (await jwt.verify(token)) as { sub: string } | false;
    if (!payload || !payload.sub) {
      set.status = 401;
      return { message: "Token tidak valid atau kadaluarsa" };
    }

    return await AuthService.getMe(payload.sub);
  });

import { Elysia } from "elysia";
import { AuthModel } from "./model";
import { AuthService } from "./service";

export const authController = new Elysia({ prefix: "/auth" })
  .model(AuthModel)
  .post("/login", ({ body }) => AuthService.loginWithEmail(body), {
    body: "loginEmail",
  })
  .post("/login-pin", ({ body }) => AuthService.loginWithPin(body), {
    body: "loginPin",
  });

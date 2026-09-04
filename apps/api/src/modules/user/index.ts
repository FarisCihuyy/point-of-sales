import { Elysia } from "elysia";
import { UserModel } from "./model";
import { UserService } from "./service";

export const userController = new Elysia({ prefix: "/users" })
  .model(UserModel)
  .get("/", () => UserService.getAll())
  .get("/:id", ({ params: { id } }) => UserService.getById(id), {
    params: "params",
  })
  .post("/", ({ body }) => UserService.create(body), {
    body: "create",
  })
  .put("/:id", ({ params: { id }, body }) => UserService.update(id, body), {
    params: "params",
    body: "update",
  })
  .delete("/:id", ({ params: { id } }) => UserService.delete(id), {
    params: "params",
  });

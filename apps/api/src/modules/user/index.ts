import { Elysia } from "elysia";
import { UserModel } from "./model";
import { UserService } from "./service";

export const userController = new Elysia({ prefix: "/users" })
  .get("/", () => UserService.getAll())
  .get("/:id", ({ params: { id } }) => UserService.getById(id), {
    params: UserModel.params,
  })
  .post("/", ({ body }) => UserService.create(body), {
    body: UserModel.create,
  })
  .put("/:id", ({ params: { id }, body }) => UserService.update(id, body), {
    params: UserModel.params,
    body: UserModel.update,
  })
  .delete("/:id", ({ params: { id } }) => UserService.delete(id), {
    params: UserModel.params,
  });

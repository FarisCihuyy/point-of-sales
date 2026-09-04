import { Elysia } from "elysia";
import { CategoryModel } from "./model";
import { CategoryService } from "./service";

export const categoryController = new Elysia({ prefix: "/categories" })
  .model(CategoryModel)
  .get("/", () => CategoryService.getAll())
  .get("/:id", ({ params: { id } }) => CategoryService.getById(id), {
    params: "params",
  })
  .post("/", ({ body }) => CategoryService.create(body), {
    body: "create",
  })
  .put("/:id", ({ params: { id }, body }) => CategoryService.update(id, body), {
    params: "params",
    body: "update",
  })
  .delete("/:id", ({ params: { id } }) => CategoryService.delete(id), {
    params: "params",
  });

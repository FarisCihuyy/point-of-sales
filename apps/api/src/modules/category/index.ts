import { Elysia } from "elysia";
import { CategoryModel } from "./model";
import { CategoryService } from "./service";

export const categoryController = new Elysia({ prefix: "/categories" })
  .get("/", () => CategoryService.getAll())
  .get("/:id", ({ params: { id } }) => CategoryService.getById(id), {
    params: CategoryModel.params,
  })
  .post("/", ({ body }) => CategoryService.create(body), {
    body: CategoryModel.create,
  })
  .put("/:id", ({ params: { id }, body }) => CategoryService.update(id, body), {
    params: CategoryModel.params,
    body: CategoryModel.update,
  })
  .delete("/:id", ({ params: { id } }) => CategoryService.delete(id), {
    params: CategoryModel.params,
  });

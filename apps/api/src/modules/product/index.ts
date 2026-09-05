import { Elysia } from "elysia";
import { ProductModel } from "./model";
import { ProductService } from "./service";

export const productController = new Elysia({ prefix: "/products" })
  .get("/", () => ProductService.getAll())
  .get("/:id", ({ params: { id } }) => ProductService.getById(id), {
    params: ProductModel.params,
  })
  .post("/", ({ body }) => ProductService.create(body), {
    body: ProductModel.create,
  })
  .put("/:id", ({ params: { id }, body }) => ProductService.update(id, body), {
    params: ProductModel.params,
    body: ProductModel.update,
  })
  .delete("/:id", ({ params: { id } }) => ProductService.delete(id), {
    params: ProductModel.params,
  });

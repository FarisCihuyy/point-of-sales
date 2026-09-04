import { Elysia } from "elysia";
import { ProductModel } from "./model";
import { ProductService } from "./service";

export const productController = new Elysia({ prefix: "/products" })
  .model(ProductModel)
  .get("/", () => ProductService.getAll())
  .get("/:id", ({ params: { id } }) => ProductService.getById(id), {
    params: "params",
  })
  .post("/", ({ body }) => ProductService.create(body), {
    body: "create",
  })
  .put("/:id", ({ params: { id }, body }) => ProductService.update(id, body), {
    params: "params",
    body: "update",
  })
  .delete("/:id", ({ params: { id } }) => ProductService.delete(id), {
    params: "params",
  });

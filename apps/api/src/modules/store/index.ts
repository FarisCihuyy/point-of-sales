import { Elysia } from "elysia";
import { StoreModel } from "./model";
import { StoreService } from "./service";

export const storeController = new Elysia({ prefix: "/stores" })
  .model(StoreModel)
  .get("/", () => StoreService.getAll())
  .get("/:id", ({ params: { id } }) => StoreService.getById(id), {
    params: "params",
  })
  .post("/", ({ body }) => StoreService.create(body), {
    body: "create",
  })
  .put("/:id", ({ params: { id }, body }) => StoreService.update(id, body), {
    params: "params",
    body: "update",
  })
  .delete("/:id", ({ params: { id } }) => StoreService.delete(id), {
    params: "params",
  });

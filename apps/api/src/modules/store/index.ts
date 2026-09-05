import { Elysia } from "elysia";
import { StoreModel } from "./model";
import { StoreService } from "./service";

export const storeController = new Elysia({ prefix: "/stores" })
  .get("/", () => StoreService.getAll())
  .get("/:id", ({ params: { id } }) => StoreService.getById(id), {
    params: StoreModel.params,
  })
  .post("/", ({ body }) => StoreService.create(body), {
    body: StoreModel.create,
  })
  .put("/:id", ({ params: { id }, body }) => StoreService.update(id, body), {
    params: StoreModel.params,
    body: StoreModel.update,
  })
  .delete("/:id", ({ params: { id } }) => StoreService.delete(id), {
    params: StoreModel.params,
  });

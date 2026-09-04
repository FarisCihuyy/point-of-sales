import { t } from "elysia";

export const StoreModel = {
  store: t.Object({
    id: t.String(),
    name: t.String(),
    businessMode: t.Union([t.Literal("retail"), t.Literal("resto")]),
    address: t.Nullable(t.String()),
    taxRate: t.Number(),
    serviceChargeRate: t.Number(),
    isActive: t.Boolean(),
    createdAt: t.Date(),
  }),

  create: t.Object({
    name: t.String({ minLength: 1, error: "Nama outlet wajib diisi" }),
    businessMode: t.Optional(
      t.Union([t.Literal("retail"), t.Literal("resto")])
    ),
    address: t.Optional(t.Nullable(t.String())),
    taxRate: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    serviceChargeRate: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    isActive: t.Optional(t.Boolean()),
  }),

  update: t.Object({
    name: t.Optional(t.String({ minLength: 1 })),
    businessMode: t.Optional(
      t.Union([t.Literal("retail"), t.Literal("resto")])
    ),
    address: t.Optional(t.Nullable(t.String())),
    taxRate: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    serviceChargeRate: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
    isActive: t.Optional(t.Boolean()),
  }),

  params: t.Object({
    id: t.String({ error: "Store ID is required" }),
  }),
};

export type StoreType = typeof StoreModel.store.static;
export type CreateStoreBody = typeof StoreModel.create.static;
export type UpdateStoreBody = typeof StoreModel.update.static;

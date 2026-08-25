import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { stores } from "./stores";
import { products } from "./products";
import { productVariants } from "./product-variants";
import { users } from "./users";

export const inventoryMovements = sqliteTable("inventory_movements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: text("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  quantityDelta: integer("quantity_delta").notNull(), // negatif = keluar (sale), positif = masuk (restock)
  reason: text("reason", {
    enum: ["sale", "adjustment", "restock", "return"],
  }).notNull(),
  referenceId: text("reference_id"), // mis. transactions.id terkait, untuk audit
  note: text("note"),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

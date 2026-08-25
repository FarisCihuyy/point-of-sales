import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { products } from "./products";

export const productVariants = sqliteTable("product_variants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // mis. "Ukuran L", "Level Pedas 3"
  priceAdjustment: real("price_adjustment").notNull().default(0), // ditambah/dikurangi dari basePrice
  sku: text("sku").unique(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

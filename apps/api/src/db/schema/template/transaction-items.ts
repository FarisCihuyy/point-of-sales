import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { transactions } from "./transactions";
import { products } from "./products";
import { productVariants } from "./product-variants";

export const transactionItems = sqliteTable("transaction_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  variantId: text("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  productNameSnapshot: text("product_name_snapshot").notNull(), // simpan nama saat itu; nama produk bisa berubah di kemudian hari
  unitPrice: real("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  discount: real("discount").notNull().default(0),
  lineTotal: real("line_total").notNull(),
});

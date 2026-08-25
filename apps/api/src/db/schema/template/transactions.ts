import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { stores } from "./stores";
import { users } from "./users";
import { shifts } from "./shifts";

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(), // client-generated UUID — JANGAN pakai $defaultFn di sini
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  cashierId: text("cashier_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  shiftId: text("shift_id").references(() => shifts.id, {
    onDelete: "set null",
  }),
  orderType: text("order_type", { enum: ["dine_in", "takeaway", "regular"] })
    .notNull()
    .default("regular"),
  subtotal: real("subtotal").notNull(),
  discountTotal: real("discount_total").notNull().default(0),
  taxTotal: real("tax_total").notNull().default(0),
  grandTotal: real("grand_total").notNull(),
  status: text("status", { enum: ["completed", "void", "refunded"] })
    .notNull()
    .default("completed"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(), // waktu asli transaksi di device kasir (bukan waktu server)
  syncedAt: integer("synced_at", { mode: "timestamp" }), // diisi server saat transaksi diterima dari client
});

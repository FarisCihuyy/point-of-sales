import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { stores } from "./stores";
import { users } from "./users";

export const shifts = sqliteTable("shifts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  cashierId: text("cashier_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  openingCash: real("opening_cash").notNull().default(0),
  closingCash: real("closing_cash"),
  openedAt: integer("opened_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  closedAt: integer("closed_at", { mode: "timestamp" }),
});

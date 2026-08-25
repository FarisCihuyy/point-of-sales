import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { tenants } from "./tenants";

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  pricePerStore: real("price_per_store").notNull(), // harga flat per outlet aktif, dalam Rupiah
  billingCycle: text("billing_cycle", { enum: ["monthly"] })
    .notNull()
    .default("monthly"),
  status: text("status", { enum: ["active", "past_due", "cancelled"] })
    .notNull()
    .default("active"),
  currentPeriodStart: integer("current_period_start", {
    mode: "timestamp",
  }).notNull(),
  currentPeriodEnd: integer("current_period_end", {
    mode: "timestamp",
  }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

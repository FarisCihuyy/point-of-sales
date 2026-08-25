import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { tenants } from "./tenants";

export const tenantDbCredentials = sqliteTable("tenant_db_credentials", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id")
    .notNull()
    .unique()
    .references(() => tenants.id, { onDelete: "cascade" }),
  tursoDbName: text("turso_db_name").notNull().unique(),
  dbUrl: text("db_url").notNull(),
  authToken: text("auth_token").notNull(),
  region: text("region"),
  provisionedAt: integer("provisioned_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

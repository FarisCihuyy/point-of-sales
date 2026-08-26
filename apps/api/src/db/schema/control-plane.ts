/**
 * SCHEMA A — CONTROL PLANE DATABASE
 * Database pusat (1 buah, di Turso) yang menyimpan registry seluruh tenant,
 * kredensial koneksi ke database masing-masing tenant, serta data langganan/billing.
 *
 * Tabel di sini TIDAK menyimpan data operasional toko (produk, transaksi, dll) —
 * itu ada di Schema B (tenant.schema.ts), 1 database terpisah per tenant.
 */

import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// tenants — 1 baris = 1 pelanggan SaaS (bisa punya banyak outlet di Tenant DB-nya)
// ---------------------------------------------------------------------------
export const tenants = sqliteTable("tenants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(), // nama usaha/tenant
  slug: text("slug").notNull().unique(), // dipakai untuk subdomain, mis. "kopikita" -> kopikita.appdomain.com
  ownerEmail: text("owner_email").notNull().unique(),
  ownerName: text("owner_name"),
  status: text("status", { enum: ["active", "suspended", "cancelled"] })
    .notNull()
    .default("active"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------------------------------------------------------------------------
// tenant_db_credentials — info koneksi ke database Turso milik tiap tenant
// ---------------------------------------------------------------------------
export const tenantDbCredentials = sqliteTable("tenant_db_credentials", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id")
    .notNull()
    .unique() // 1 tenant = 1 database (relasi 1-ke-1)
    .references(() => tenants.id, { onDelete: "cascade" }),
  tursoDbName: text("turso_db_name").notNull().unique(), // nama database di Turso, mis. "tenant-kopikita"
  dbUrl: text("db_url").notNull(), // libsql://tenant-kopikita-xxx.turso.io
  authToken: text("auth_token").notNull(), // WAJIB dienkripsi di layer aplikasi sebelum disimpan
  region: text("region"), // mis. "sin" (Singapore) untuk latensi lebih rendah dari Indonesia
  provisionedAt: integer("provisioned_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------------------------------------------------------------------------
// subscriptions — status langganan aktif per tenant (flat fee per outlet/bulan)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// billing_invoices — tagihan yang di-generate tiap siklus billing
// ---------------------------------------------------------------------------
export const billingInvoices = sqliteTable("billing_invoices", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  subscriptionId: text("subscription_id")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "cascade" }),
  activeStoresCount: integer("active_stores_count").notNull(), // jumlah outlet aktif saat invoice dibuat
  amount: real("amount").notNull(), // activeStoresCount * pricePerStore
  status: text("status", { enum: ["unpaid", "paid", "overdue"] })
    .notNull()
    .default("unpaid"),
  issuedAt: integer("issued_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  dueAt: integer("due_at", { mode: "timestamp" }).notNull(),
  paidAt: integer("paid_at", { mode: "timestamp" }),
});

// ---------------------------------------------------------------------------
// Relations (opsional, memudahkan query pakai db.query.tenants.findMany({ with: {...} }))
// ---------------------------------------------------------------------------
export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  dbCredentials: one(tenantDbCredentials, {
    fields: [tenants.id],
    references: [tenantDbCredentials.tenantId],
  }),
  subscriptions: many(subscriptions),
  invoices: many(billingInvoices),
}));

export const subscriptionsRelations = relations(
  subscriptions,
  ({ one, many }) => ({
    tenant: one(tenants, {
      fields: [subscriptions.tenantId],
      references: [tenants.id],
    }),
    invoices: many(billingInvoices),
  }),
);

export const billingInvoicesRelations = relations(
  billingInvoices,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [billingInvoices.tenantId],
      references: [tenants.id],
    }),
    subscription: one(subscriptions, {
      fields: [billingInvoices.subscriptionId],
      references: [subscriptions.id],
    }),
  }),
);

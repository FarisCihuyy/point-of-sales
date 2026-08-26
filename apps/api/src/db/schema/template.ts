/**
 * SCHEMA B — TENANT DATABASE (TEMPLATE)
 * Skema ini di-migrate ke SETIAP database Turso baru yang dibuat saat provisioning
 * tenant baru (1 database per tenant, terisolasi penuh dari tenant lain).
 *
 * 1 tenant bisa punya banyak "stores" (outlet/cabang), masing-masing dengan
 * business_mode sendiri (retail / resto).
 */

import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ---------------------------------------------------------------------------
// stores — outlet/cabang milik tenant ini
// ---------------------------------------------------------------------------
export const stores = sqliteTable("stores", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  businessMode: text("business_mode", { enum: ["retail", "resto"] })
    .notNull()
    .default("retail"), // menentukan terminologi & field di UI, bukan skema data terpisah
  address: text("address"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true), // dipakai untuk hitung billing (active_stores_count)
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------------------------------------------------------------------------
// users — staff (owner & kasir)
// ---------------------------------------------------------------------------
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id").references(() => stores.id, {
    onDelete: "set null",
  }), // null = owner, akses semua outlet
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["owner", "cashier"] })
    .notNull()
    .default("cashier"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------------------------------------------------------------------------
// categories & products
// ---------------------------------------------------------------------------
export const categories = sqliteTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const products = sqliteTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  sku: text("sku").unique(),
  barcode: text("barcode").unique(),
  basePrice: real("base_price").notNull(),
  imageUrl: text("image_url"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

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

// ---------------------------------------------------------------------------
// inventory_movements — log semua perubahan stok (bukan hanya angka akhir)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// shifts — buka/tutup kas per kasir
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// transactions — id di-generate di CLIENT (Dexie.js) sebelum dikirim ke server,
// supaya proses sync bisa di-retry dengan aman tanpa duplikasi (idempotent).
// ---------------------------------------------------------------------------
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

export const payments = sqliteTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  method: text("method", { enum: ["cash", "qris"] }).notNull(),
  amount: real("amount").notNull(),
  changeGiven: real("change_given").default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------------------------------------------------------------------------
// Relations (opsional, memudahkan query pakai db.query.transactions.findMany({ with: {...} }))
// ---------------------------------------------------------------------------
export const storesRelations = relations(stores, ({ many }) => ({
  users: many(users),
  transactions: many(transactions),
  inventoryMovements: many(inventoryMovements),
  shifts: many(shifts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  }),
);

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    store: one(stores, {
      fields: [transactions.storeId],
      references: [stores.id],
    }),
    cashier: one(users, {
      fields: [transactions.cashierId],
      references: [users.id],
    }),
    items: many(transactionItems),
    payments: many(payments),
  }),
);

export const transactionItemsRelations = relations(
  transactionItems,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionItems.transactionId],
      references: [transactions.id],
    }),
    product: one(products, {
      fields: [transactionItems.productId],
      references: [products.id],
    }),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  transaction: one(transactions, {
    fields: [payments.transactionId],
    references: [transactions.id],
  }),
}));

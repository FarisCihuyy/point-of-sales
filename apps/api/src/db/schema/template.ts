/**
 * SCHEMA TENANT DATABASE (TEMPLATE)
 * Skema ini di-migrate ke setiap database Turso tenant baru.
 * 1 tenant memiliki 1 database Turso terisolasi.
 */

import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ---------------------------------------------------------------------------
// stores — outlet/cabang milik tenant
// ---------------------------------------------------------------------------
export const stores = sqliteTable("stores", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  businessMode: text("business_mode", { enum: ["retail", "resto"] })
    .notNull()
    .default("retail"),
  address: text("address"),
  taxRate: real("tax_rate").notNull().default(0),
  serviceChargeRate: real("service_charge_rate").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------------------------------------------------------------------------
// users — staff (owner, manager, cashier, waitstaff)
// ---------------------------------------------------------------------------
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id").references(() => stores.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["owner", "manager", "cashier", "waitstaff"] })
    .notNull()
    .default("cashier"),
  pin: text("pin"), // 4-6 digit PIN untuk otentikasi cepat kasir / presensi
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
  sku: text("sku"),
  barcode: text("barcode"),
  basePrice: real("base_price").notNull(),
  costPrice: real("cost_price").notNull().default(0),
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
  name: text("name").notNull(),
  priceAdjustment: real("price_adjustment").notNull().default(0),
  sku: text("sku"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export const productModifiers = sqliteTable("product_modifiers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: real("price").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

// ---------------------------------------------------------------------------
// Floor Areas, Tables & Reservations (Table Management)
// ---------------------------------------------------------------------------
export const floorAreas = sqliteTable("floor_areas", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  level: integer("level").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const tables = sqliteTable("tables", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  areaId: text("area_id").references(() => floorAreas.id, {
    onDelete: "set null",
  }),
  tableNumber: text("table_number").notNull(),
  capacity: integer("capacity").notNull().default(4),
  status: text("status", {
    enum: ["available", "occupied", "reserved", "cleaning"],
  })
    .notNull()
    .default("available"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const reservations = sqliteTable("reservations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  tableId: text("table_id").references(() => tables.id, {
    onDelete: "set null",
  }),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  reservedAt: integer("reserved_at", { mode: "timestamp" }).notNull(),
  pax: integer("pax").notNull().default(1),
  depositAmount: real("deposit_amount").notNull().default(0),
  status: text("status", {
    enum: ["booked", "confirmed", "seated", "cancelled", "no_show"],
  })
    .notNull()
    .default("booked"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
export const customers = sqliteTable("customers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------------------------------------------------------------------------
// Inventory, Suppliers, Purchase Orders & Transfers
// ---------------------------------------------------------------------------
export const suppliers = sqliteTable("suppliers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  paymentTerms: text("payment_terms"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const inventoryItems = sqliteTable("inventory_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: text("sku"),
  category: text("category"),
  uom: text("uom").notNull().default("pcs"),
  minStock: integer("min_stock").notNull().default(5),
  currentStock: integer("current_stock").notNull().default(0),
  costPrice: real("cost_price").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const inventoryMovements = sqliteTable("inventory_movements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, {
    onDelete: "cascade",
  }),
  variantId: text("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  inventoryItemId: text("inventory_item_id").references(
    () => inventoryItems.id,
    { onDelete: "set null" },
  ),
  quantityDelta: integer("quantity_delta").notNull(),
  reason: text("reason", {
    enum: ["sale", "adjustment", "restock", "return", "transfer"],
  }).notNull(),
  referenceId: text("reference_id"),
  note: text("note"),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const purchaseOrders = sqliteTable("purchase_orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  supplierId: text("supplier_id").references(() => suppliers.id, {
    onDelete: "set null",
  }),
  poNumber: text("po_number").notNull(),
  status: text("status", {
    enum: ["draft", "submitted", "partial_received", "fully_received", "completed"],
  })
    .notNull()
    .default("draft"),
  totalAmount: real("total_amount").notNull().default(0),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const purchaseOrderItems = sqliteTable("purchase_order_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  purchaseOrderId: text("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  inventoryItemId: text("inventory_item_id").references(
    () => inventoryItems.id,
    { onDelete: "restrict" },
  ),
  quantityOrdered: integer("quantity_ordered").notNull(),
  quantityReceived: integer("quantity_received").notNull().default(0),
  unitCost: real("unit_cost").notNull(),
  lineTotal: real("line_total").notNull(),
});

export const stockTransfers = sqliteTable("stock_transfers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fromStoreId: text("from_store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "restrict" }),
  toStoreId: text("to_store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "restrict" }),
  transferNumber: text("transfer_number").notNull(),
  status: text("status", {
    enum: ["requested", "in_transit", "received_and_verified"],
  })
    .notNull()
    .default("requested"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const stockTransferItems = sqliteTable("stock_transfer_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  transferId: text("transfer_id")
    .notNull()
    .references(() => stockTransfers.id, { onDelete: "cascade" }),
  inventoryItemId: text("inventory_item_id")
    .notNull()
    .references(() => inventoryItems.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
});

export const stockOpnames = sqliteTable("stock_opnames", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  conductedBy: text("conducted_by").references(() => users.id, {
    onDelete: "set null",
  }),
  status: text("status", { enum: ["draft", "submitted", "approved"] })
    .notNull()
    .default("draft"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const stockOpnameItems = sqliteTable("stock_opname_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  opnameId: text("opname_id")
    .notNull()
    .references(() => stockOpnames.id, { onDelete: "cascade" }),
  inventoryItemId: text("inventory_item_id")
    .notNull()
    .references(() => inventoryItems.id, { onDelete: "restrict" }),
  systemStock: integer("system_stock").notNull(),
  physicalStock: integer("physical_stock").notNull(),
  discrepancy: integer("discrepancy").notNull(),
  reason: text("reason"),
});

// ---------------------------------------------------------------------------
// Shifts, Schedules & Attendance (Shifting)
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
  expectedCash: real("expected_cash"),
  discrepancy: real("discrepancy"),
  note: text("note"),
  openedAt: integer("opened_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  closedAt: integer("closed_at", { mode: "timestamp" }),
});

export const shiftSchedules = sqliteTable("shift_schedules", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Pagi, Siang, Malam
  startTime: text("start_time").notNull(), // "08:00"
  endTime: text("end_time").notNull(), // "16:00"
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const attendances = sqliteTable("attendances", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scheduleId: text("schedule_id").references(() => shiftSchedules.id, {
    onDelete: "set null",
  }),
  clockIn: integer("clock_in", { mode: "timestamp" }).notNull(),
  clockOut: integer("clock_out", { mode: "timestamp" }),
  status: text("status", { enum: ["on_time", "late", "early_leave", "absent"] })
    .notNull()
    .default("on_time"),
  notes: text("notes"),
});

// ---------------------------------------------------------------------------
// Transactions, Orders & Payments
// ---------------------------------------------------------------------------
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(), // client-generated UUID
  storeId: text("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  cashierId: text("cashier_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  customerId: text("customer_id").references(() => customers.id, {
    onDelete: "set null",
  }),
  tableId: text("table_id").references(() => tables.id, {
    onDelete: "set null",
  }),
  shiftId: text("shift_id").references(() => shifts.id, {
    onDelete: "set null",
  }),
  orderType: text("order_type", {
    enum: ["dine_in", "takeaway", "delivery", "qr_order", "regular"],
  })
    .notNull()
    .default("regular"),
  subtotal: real("subtotal").notNull(),
  discountTotal: real("discount_total").notNull().default(0),
  taxTotal: real("tax_total").notNull().default(0),
  serviceChargeTotal: real("service_charge_total").notNull().default(0),
  grandTotal: real("grand_total").notNull(),
  status: text("status", {
    enum: ["pending", "in_progress", "completed", "void", "refunded"],
  })
    .notNull()
    .default("completed"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  syncedAt: integer("synced_at", { mode: "timestamp" }),
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
  productNameSnapshot: text("product_name_snapshot").notNull(),
  unitPrice: real("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  discount: real("discount").notNull().default(0),
  lineTotal: real("line_total").notNull(),
  notes: text("notes"),
});

export const payments = sqliteTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  method: text("method", {
    enum: ["cash", "qris", "va", "ewallet", "card"],
  }).notNull(),
  amount: real("amount").notNull(),
  changeGiven: real("change_given").default(0),
  referenceNumber: text("reference_number"),
  paymentStatus: text("payment_status", { enum: ["pending", "success", "failed"] })
    .notNull()
    .default("success"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const storesRelations = relations(stores, ({ many }) => ({
  users: many(users),
  transactions: many(transactions),
  inventoryMovements: many(inventoryMovements),
  shifts: many(shifts),
  floorAreas: many(floorAreas),
  tables: many(tables),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  modifiers: many(productModifiers),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const productModifiersRelations = relations(productModifiers, ({ one }) => ({
  product: one(products, {
    fields: [productModifiers.productId],
    references: [products.id],
  }),
}));

export const tablesRelations = relations(tables, ({ one, many }) => ({
  store: one(stores, {
    fields: [tables.storeId],
    references: [stores.id],
  }),
  area: one(floorAreas, {
    fields: [tables.areaId],
    references: [floorAreas.id],
  }),
  reservations: many(reservations),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  store: one(stores, {
    fields: [transactions.storeId],
    references: [stores.id],
  }),
  cashier: one(users, {
    fields: [transactions.cashierId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
  table: one(tables, {
    fields: [transactions.tableId],
    references: [tables.id],
  }),
  items: many(transactionItems),
  payments: many(payments),
}));

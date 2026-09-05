/**
 * pos-db.ts
 * Instance Dexie tunggal untuk seluruh POS Terminal.
 * Import `posDb` dari file ini di manapun butuh akses IndexedDB.
 *
 * Versi schema: bump angka version() setiap kali ada perubahan skema tabel.
 */

import Dexie, { type EntityTable } from "dexie";
import type {
  LocalCategory,
  LocalProduct,
  LocalProductVariant,
  LocalInventoryItem,
  LocalTransaction,
  LocalTransactionItem,
  LocalPayment,
  SyncQueueEntry,
} from "./types";

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------

class PosDatabase extends Dexie {
  // Catalog cache (read-only dari server)
  categories!: EntityTable<LocalCategory, "id">;
  products!: EntityTable<LocalProduct, "id">;
  productVariants!: EntityTable<LocalProductVariant, "id">;
  inventoryItems!: EntityTable<LocalInventoryItem, "id">;

  // Transaksi (write lokal, sync ke server)
  transactions!: EntityTable<LocalTransaction, "id">;
  transactionItems!: EntityTable<LocalTransactionItem, "id">;
  payments!: EntityTable<LocalPayment, "id">;

  // Antrian sync
  syncQueue!: EntityTable<SyncQueueEntry, "id">;

  constructor() {
    super("pos-db");

    this.version(1).stores({
      // Catalog — index by id (PK) + field yang sering di-query
      categories: "id, name",
      products: "id, categoryId, barcode, sku, isActive, updatedAt",
      productVariants: "id, productId, isActive",
      inventoryItems: "id, storeId, sku",

      // Transaksi — index by id + field filter umum
      transactions: "id, storeId, cashierId, status, syncStatus, createdAt",
      transactionItems: "id, transactionId, productId",
      payments: "id, transactionId",

      // Sync queue — auto-increment PK, index by status & referenceId
      syncQueue: "++id, status, referenceId, createdAt",
    });
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

export const posDb = new PosDatabase();

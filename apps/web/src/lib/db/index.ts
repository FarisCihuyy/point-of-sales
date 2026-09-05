/**
 * Barrel export untuk seluruh Offline-First DB engine.
 *
 * Cara pakai:
 *   import { posDb, usePosDb, hydrateCatalog, flushSyncQueue } from "@/lib/db";
 */

export { posDb } from "./pos-db";
export { hydrateCatalog, flushSyncQueue } from "./sync-worker";
export { usePosDb } from "./use-pos-db";
export type {
  LocalCategory,
  LocalProduct,
  LocalProductVariant,
  LocalInventoryItem,
  LocalTransaction,
  LocalTransactionItem,
  LocalPayment,
  SyncQueueEntry,
  SyncStatus,
  SyncOperation,
  OrderType,
  TransactionStatus,
  PaymentMethod,
  PaymentStatus,
} from "./types";

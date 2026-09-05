/**
 * types.ts
 * TypeScript interfaces untuk tabel lokal Dexie (IndexedDB).
 * Mencerminkan skema Drizzle yang relevan untuk POS + field tambahan offline.
 */

// ---------------------------------------------------------------------------
// Catalog (read-only cache dari server)
// ---------------------------------------------------------------------------

export interface LocalCategory {
  id: string;
  name: string;
  createdAt: number; // unix timestamp
}

export interface LocalProduct {
  id: string;
  categoryId: string | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  basePrice: number;
  costPrice: number;
  imageUrl: string | null;
  isActive: number; // 0 | 1
  updatedAt: number; // unix timestamp — dipakai untuk delta sync
}

export interface LocalProductVariant {
  id: string;
  productId: string;
  name: string;
  priceAdjustment: number;
  sku: string | null;
  isActive: number; // 0 | 1
}

export interface LocalInventoryItem {
  id: string;
  storeId: string;
  name: string;
  sku: string | null;
  uom: string;
  minStock: number;
  currentStock: number;
  costPrice: number;
}

// ---------------------------------------------------------------------------
// Transactions (tulis lokal, sync ke server)
// ---------------------------------------------------------------------------

export type SyncStatus = "pending" | "syncing" | "synced" | "failed";
export type OrderType = "dine_in" | "takeaway" | "delivery" | "qr_order" | "regular";
export type TransactionStatus = "pending" | "in_progress" | "completed" | "void" | "refunded";

export interface LocalTransaction {
  id: string; // client-generated UUID (idempotency key)
  storeId: string;
  cashierId: string;
  customerId: string | null;
  tableId: string | null;
  shiftId: string | null;
  orderType: OrderType;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  serviceChargeTotal: number;
  grandTotal: number;
  status: TransactionStatus;
  createdAt: number; // unix timestamp
  syncedAt: number | null;
  /** Field tambahan untuk offline engine */
  syncStatus: SyncStatus;
}

export interface LocalTransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  variantId: string | null;
  productNameSnapshot: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  lineTotal: number;
  notes: string | null;
}

export type PaymentMethod = "cash" | "qris" | "va" | "ewallet" | "card";
export type PaymentStatus = "pending" | "success" | "failed";

export interface LocalPayment {
  id: string;
  transactionId: string;
  method: PaymentMethod;
  amount: number;
  changeGiven: number;
  referenceNumber: string | null;
  paymentStatus: PaymentStatus;
  createdAt: number; // unix timestamp
}

// ---------------------------------------------------------------------------
// Sync Queue
// ---------------------------------------------------------------------------

export type SyncOperation = "create_transaction";

export interface SyncQueueEntry {
  /** Auto-increment key dari Dexie */
  id?: number;
  operation: SyncOperation;
  /** ID transaksi (client_generated_id) */
  referenceId: string;
  /** Payload JSON siap kirim ke API */
  payload: string;
  status: SyncStatus;
  retryCount: number;
  lastError: string | null;
  createdAt: number; // unix timestamp
}

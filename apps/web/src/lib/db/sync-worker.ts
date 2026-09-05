/**
 * sync-worker.ts
 * Background sync logic untuk Offline-First POS engine.
 *
 * Dua tanggung jawab utama:
 *  1. hydrateCatalog()  — pull produk/kategori dari server ke IndexedDB
 *  2. flushSyncQueue()  — push transaksi pending dari IndexedDB ke server
 *
 * Keduanya idempotent dan aman dipanggil berulang kali.
 */

import { posDb } from "./pos-db";
import type {
  LocalCategory,
  LocalProduct,
  LocalProductVariant,
} from "./types";
import apiClient from "@/lib/api-client";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_RETRY = 3;

// ---------------------------------------------------------------------------
// Tipe response minimal dari API (sesuaikan saat endpoint tersedia)
// ---------------------------------------------------------------------------

interface ApiCategory {
  id: string;
  name: string;
  createdAt: number;
}

interface ApiProduct {
  id: string;
  categoryId: string | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  basePrice: number;
  costPrice: number;
  imageUrl: string | null;
  isActive: number;
  updatedAt: number;
  variants?: Array<{
    id: string;
    productId: string;
    name: string;
    priceAdjustment: number;
    sku: string | null;
    isActive: number;
  }>;
}

// ---------------------------------------------------------------------------
// hydrateCatalog
// ---------------------------------------------------------------------------

/**
 * Mengambil katalog produk dan kategori dari server lalu menyimpannya
 * ke IndexedDB. Menggunakan strategi delta sync berdasarkan `updatedAt`
 * produk yang sudah ada di lokal.
 *
 * Dipanggil satu kali setelah login PIN berhasil, dan setiap kali
 * koneksi online kembali.
 */
export async function hydrateCatalog(): Promise<void> {
  try {
    // Cari timestamp produk terakhir yang sudah di-cache lokal
    const latestProduct = await posDb.products
      .orderBy("updatedAt")
      .last();
    const updatedAfter = latestProduct?.updatedAt ?? 0;

    // --- Ambil kategori (selalu full refresh, ringan) ---
    const categories = await apiClient.get<ApiCategory[]>("/api/catalog/categories");
    const localCategories: LocalCategory[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
    }));
    await posDb.categories.bulkPut(localCategories);

    // --- Ambil produk yang berubah setelah updatedAfter ---
    const products = await apiClient.get<ApiProduct[]>(
      `/api/catalog/products?updatedAfter=${updatedAfter}`
    );

    const localProducts: LocalProduct[] = [];
    const localVariants: LocalProductVariant[] = [];

    for (const p of products) {
      localProducts.push({
        id: p.id,
        categoryId: p.categoryId,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        basePrice: p.basePrice,
        costPrice: p.costPrice,
        imageUrl: p.imageUrl,
        isActive: p.isActive,
        updatedAt: p.updatedAt,
      });

      if (p.variants) {
        for (const v of p.variants) {
          localVariants.push({
            id: v.id,
            productId: v.productId,
            name: v.name,
            priceAdjustment: v.priceAdjustment,
            sku: v.sku,
            isActive: v.isActive,
          });
        }
      }
    }

    await posDb.products.bulkPut(localProducts);
    if (localVariants.length > 0) {
      await posDb.productVariants.bulkPut(localVariants);
    }

    console.log(
      `[sync] Catalog hydrated — ${localCategories.length} categories, ${localProducts.length} products updated`
    );
  } catch (err) {
    console.warn("[sync] hydrateCatalog failed (offline?):", err);
    // Gagal silently — kasir masih bisa gunakan cache lama
  }
}

// ---------------------------------------------------------------------------
// flushSyncQueue
// ---------------------------------------------------------------------------

/**
 * Mengirim semua transaksi di sync_queue dengan status "pending" ke server.
 * Idempotent — server harus menangani duplikasi via `client_generated_id`.
 *
 * Dipanggil:
 *  - Setelah checkout berhasil (optimistic flush)
 *  - Saat event `online` terpicu
 *  - Setiap 30 detik sebagai fallback polling
 */
export async function flushSyncQueue(): Promise<void> {
  const pendingEntries = await posDb.syncQueue
    .where("status")
    .equals("pending")
    .toArray();

  if (pendingEntries.length === 0) return;

  console.log(`[sync] Flushing ${pendingEntries.length} queued transaction(s)...`);

  for (const entry of pendingEntries) {
    // Tandai sebagai "syncing" untuk menghindari double-send
    await posDb.syncQueue.update(entry.id!, { status: "syncing" });

    try {
      const payload = JSON.parse(entry.payload);
      await apiClient.post("/api/transactions", payload);

      // Sukses — hapus dari queue dan update status transaksi lokal
      await posDb.syncQueue.delete(entry.id!);
      await posDb.transactions.update(entry.referenceId, {
        syncStatus: "synced",
        syncedAt: Math.floor(Date.now() / 1000),
      });

      console.log(`[sync] Transaction ${entry.referenceId} synced ✓`);
    } catch (err) {
      const newRetryCount = entry.retryCount + 1;
      const isFatal = newRetryCount >= MAX_RETRY;

      await posDb.syncQueue.update(entry.id!, {
        status: isFatal ? "failed" : "pending",
        retryCount: newRetryCount,
        lastError: err instanceof Error ? err.message : String(err),
      });

      if (isFatal) {
        await posDb.transactions.update(entry.referenceId, {
          syncStatus: "failed",
        });
        console.error(
          `[sync] Transaction ${entry.referenceId} permanently failed after ${MAX_RETRY} retries`
        );
      } else {
        console.warn(
          `[sync] Transaction ${entry.referenceId} retry ${newRetryCount}/${MAX_RETRY}`
        );
      }
    }
  }
}

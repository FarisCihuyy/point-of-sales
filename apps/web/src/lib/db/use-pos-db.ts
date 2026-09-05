"use client";

/**
 * use-pos-db.ts
 * React hook sebagai pintu masuk ke seluruh Offline-First POS engine.
 *
 * Tanggungjawab:
 *  - Meng-expose instance `posDb` yang sudah siap digunakan.
 *  - Melacak status koneksi online/offline.
 *  - Menjalankan hydrateCatalog() satu kali saat mount pertama kali (post-login).
 *  - Mendaftarkan listener `online` untuk trigger flushSyncQueue().
 *  - Polling flushSyncQueue() setiap 30 detik sebagai fallback.
 */

import { useEffect, useRef, useState } from "react";
import { posDb } from "./pos-db";
import { hydrateCatalog, flushSyncQueue } from "./sync-worker";

const SYNC_INTERVAL_MS = 30_000; // 30 detik

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePosDb() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isCatalogReady, setIsCatalogReady] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // --- Initial hydration setelah mount (post PIN login) ---
    const init = async () => {
      await hydrateCatalog();
      setIsCatalogReady(true);
      // Flush setelah hydration selesai untuk kirim transaksi yang tersisa
      await flushSyncQueue();
    };
    init();

    // --- Event listener online/offline ---
    const handleOnline = async () => {
      setIsOnline(true);
      await hydrateCatalog();
      await flushSyncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // --- Polling fallback setiap 30 detik ---
    intervalRef.current = setInterval(async () => {
      if (navigator.onLine) {
        await flushSyncQueue();
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    /** Instance Dexie siap digunakan untuk baca/tulis langsung */
    db: posDb,
    /** Apakah browser saat ini online */
    isOnline,
    /** Apakah katalog produk sudah di-hydrate dari server */
    isCatalogReady,
    /** Trigger sync manual (opsional, untuk tombol refresh dll) */
    syncNow: async () => {
      await hydrateCatalog();
      await flushSyncQueue();
    },
  };
}

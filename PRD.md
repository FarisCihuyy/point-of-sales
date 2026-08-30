# Product Requirements Document (PRD)
## Sistem POS SaaS Multi-Tenant, Offline-First untuk Retail & F&B

| | |
|---|---|
| **Versi** | 0.1 (Draft) |
| **Tanggal** | 25 Agustus 2026 |
| **Status** | Draft v0.2 — vertikal bisnis, cakupan fitur MVP, dan model bisnis telah dikonfirmasi. Sisa poin terbuka ditandai 🔸, lihat Bagian 13. |

---

## 1. Ringkasan Eksekutif

Produk ini adalah **platform POS (Point of Sale) berbasis SaaS multi-tenant**, dirancang generik untuk melayani **retail maupun F&B** dalam satu produk yang sama (dibedakan lewat "mode toko" yang dikonfigurasi saat onboarding). Diferensiasi utama produk adalah **arsitektur offline-first**: kasir tetap bisa bertransaksi normal walau koneksi internet toko putus, dengan data tersinkronisasi otomatis ke cloud saat koneksi kembali tersedia.

Model bisnis penyewaan menggunakan **flat fee per outlet aktif per bulan** — semakin banyak cabang yang didaftarkan tenant, semakin besar tagihan bulanannya, tanpa batasan jumlah transaksi.

Arsitektur backend dirancang agar **biaya infrastruktur sangat rendah di tahap awal** (mendekati $0 untuk puluhan tenant pertama) namun tetap punya jalur scaling yang jelas, menggunakan strategi **database-per-tenant** di atas Turso (libSQL).

---

## 2. Latar Belakang & Masalah

Bisnis retail/F&B skala kecil-menengah di Indonesia sering menghadapi:

1. **Koneksi internet tidak stabil**, terutama di luar kota besar — POS berbasis cloud murni (SaaS konvensional) berhenti berfungsi saat internet mati, menghentikan transaksi (kerugian langsung).
2. **Harga POS enterprise terlalu mahal** untuk usaha kecil, sementara aplikasi POS gratis/murah biasanya minim fitur multi-outlet, laporan, atau tidak reliable.
3. Provider POS existing sering memakai arsitektur database tunggal (shared) sehingga risiko *noisy neighbor*, kebocoran data antar tenant, dan kesulitan migrasi data satu tenant tanpa mengganggu yang lain.

🔸 **Asumsi:** Target pasar utama adalah UMKM retail/F&B 1–20 outlet di Indonesia, dengan sensitivitas harga tinggi dan kebutuhan reliability offline sebagai *selling point* utama.

---

## 3. Tujuan Produk (Goals)

- Menyediakan POS yang **tetap bisa transaksi 100% saat offline**, tanpa kehilangan data.
- Biaya hosting/infrastruktur **linear terhadap jumlah tenant aktif**, bukan biaya tetap besar di awal (cocok untuk model bisnis SaaS bootstrap).
- **Isolasi data per tenant** yang kuat by-design (bukan hanya row-level filtering), untuk keamanan dan kemudahan backup/restore per tenant.
- Onboarding tenant baru cepat (idealnya self-service, < 5 menit dari daftar sampai bisa transaksi).
- Codebase ringan dan mudah dikelola oleh tim kecil (1–3 developer).

### Non-Goals (Sementara)
- Bukan ERP lengkap (akuntansi penuh, payroll, dsb) di fase awal.
- Bukan marketplace / channel penjualan online (fokus transaksi di outlet fisik).

---

## 4. Target Pengguna & Persona

| Persona | Peran |
|---|---|
| **Tenant Owner** | Pemilik usaha yang mendaftar & berlangganan. Mengelola outlet, produk, user, melihat laporan. |
| **Kasir (Cashier)** | Melakukan transaksi harian, akses terbatas ke fitur kasir & shift. |
| **Manajer Outlet** 🔸 | Peran menengah antara owner & kasir (opsional, perlu dikonfirmasi apakah dibutuhkan di MVP). |
| **Super Admin (Internal)** | Tim SaaS provider — provisioning tenant baru, monitoring, billing, support. |

---

## 5. Lingkup Produk (Scope)

### 5.1 In-Scope — MVP (dikonfirmasi)
- **Mode toko: Retail atau Resto**, dipilih saat setup outlet — memengaruhi terminologi & field dasar (mis. tipe order dine-in/takeaway & varian rasa/ukuran untuk Resto; SKU/barcode untuk Retail). *Fitur operasional lanjutan khusus resto (meja, KDS) tidak termasuk MVP — lihat 5.2.*
- Transaksi kasir (jual produk, hitung total, diskon per item/nota, pajak/service charge)
- Manajemen produk & kategori (termasuk varian produk sederhana)
- Manajemen stok/inventory **penuh**: pengurangan otomatis saat transaksi, stok opname/adjustment manual, riwayat pergerakan stok per outlet
- Multi-metode pembayaran: tunai, dan minimal 1 metode non-tunai (QRIS)
- Cetak struk (thermal printer via browser)
- Mode offline penuh + sinkronisasi otomatis saat online kembali
- Multi-outlet per tenant (1 tenant bisa punya >1 cabang, kelola dari satu akun)
- Role dasar: Owner & Kasir
- **Laporan lanjutan**: penjualan per periode, produk terlaris, perbandingan antar outlet, laporan per shift/kasir, export data 🔸 (format export — CSV/PDF — perlu dikonfirmasi)
- **Billing & langganan**: flat fee per outlet aktif/bulan, penghitungan tagihan otomatis mengikuti jumlah outlet tenant, riwayat invoice
- Tenant self-onboarding (daftar → pilih mode toko → provisioning DB otomatis → langsung pakai)

### 5.2 Out of Scope — Fase Selanjutnya
- **Fitur operasional F&B lanjutan**: manajemen meja/table layout, open bill per meja, Kitchen Display System (KDS) — 🔸 diasumsikan masuk Fase 2, mengingat MVP mencakup "generik retail+resto" pada level katalog/transaksi/inventory/laporan, bukan alur operasional resto yang lebih kompleks. **Perlu dikonfirmasi** apakah ini harus masuk MVP.
- Integrasi akuntansi (misal Accurate, Jurnal)
- Manajemen supplier & purchase order kompleks
- Program loyalty/membership pelanggan
- Integrasi marketplace online (GoFood, GrabFood, dsb)
- Multi-currency
- Aplikasi native mobile (di luar PWA)
- Penagihan otomatis via kartu/VA (metode penagihan flat-fee ke tenant — lihat pertanyaan terbuka di Bagian 13)

---

## 6. Arsitektur Teknis

### 6.1 Stack Teknologi (ditentukan)

| Layer | Teknologi | Catatan |
|---|---|---|
| Backend API | ElysiaJS di atas Bun runtime | Cepat, hemat RAM, cocok untuk banyak instance kecil per tenant/cluster |
| Frontend | Next.js + Tailwind CSS + shadcn/ui | Dikemas sebagai PWA (installable, service worker) |
| Local storage (offline) | Dexie.js (wrapper IndexedDB) | Menyimpan katalog produk, antrian transaksi offline |
| ORM | Drizzle ORM | Type-safe, ringan, cocok untuk pola multi-database |
| Database | Turso (libSQL / distributed SQLite) | Strategi **database-per-tenant** |

### 6.2 Strategi Multi-Tenant: Database-per-Tenant

- Setiap tenant (toko/usaha) memiliki **1 database Turso terpisah**, terisolasi penuh dari tenant lain.
- Dibutuhkan **1 "Control Plane" database pusat** (bisa juga di Turso) yang menyimpan:
  - Registry tenant (tenant_id, nama, subdomain/slug, status langganan)
  - Mapping tenant → connection string / auth token DB Turso masing-masing
  - Data billing & subscription
- Alur request: `subdomain/slug atau header X-Tenant-ID` → backend Elysia resolve tenant di Control Plane DB → buka koneksi Drizzle ke Turso DB tenant tsb → proses request.
- 🔸 **Asumsi:** Koneksi ke Turso per-tenant dibuat *on-demand* dengan connection pooling/caching di memori (bukan 1 koneksi permanen per tenant) agar hemat resource saat jumlah tenant besar.
- Provisioning tenant baru: saat sign-up, backend memanggil Turso Platform API untuk membuat database baru dari template schema (migrasi Drizzle dijalankan otomatis), lalu menyimpan kredensialnya di Control Plane DB.
- Setiap outlet/store menyimpan field `business_mode` (`retail` | `resto`) di tabel `stores` pada Tenant DB — dipakai frontend untuk menyesuaikan terminologi & field form (bukan skema database terpisah), sehingga satu tenant dengan multi-outlet bisa punya campuran mode retail & resto jika diperlukan.
- Field `active_stores_count` pada Control Plane DB dipakai sebagai basis perhitungan tagihan flat-fee bulanan (Bagian 11).

### 6.3 Offline-First & Strategi Sinkronisasi

Prinsip: **local-first write** — semua aksi kasir (transaksi, buka/tutup shift) ditulis dulu ke Dexie.js secara instan (UI tidak menunggu jaringan), lalu dikirim ke server melalui *sync queue* di background.

- **Katalog produk**: di-cache penuh ke Dexie saat online, dipakai sebagai sumber data saat offline.
- **Transaksi penjualan**: bersifat *append-only* (immutable) — dikirim sebagai log transaksi dengan `client_generated_id` (UUID) untuk **idempotency**, sehingga aman di-retry tanpa duplikasi saat sync ulang.
- **Update stok**: 🔸 **Asumsi (rekomendasi teknis)** — stok disinkronkan sebagai **delta/operasi** (`-2 unit`), bukan nilai absolut, untuk menghindari *lost update* ketika beberapa kasir offline mengurangi stok produk yang sama secara bersamaan.
- **Conflict resolution**: karena data transaksi append-only, konflik utama hanya pada stok & data master (harga produk berubah saat kasir offline). Strategi awal: *last-write-wins* berbasis timestamp server untuk data master, dengan notifikasi ke owner jika terjadi perubahan signifikan saat sinkron.
- Service Worker (PWA) menangani caching aset & background sync API.

### 6.4 Diagram Arsitektur (Ringkas)

```
[PWA Kasir - Next.js]
   ├── Dexie.js (IndexedDB) — cache produk + antrian transaksi offline
   ├── Service Worker — caching aset, background sync
   │
   ▼ (saat online)
[ElysiaJS API - Bun]
   ├── Resolver Tenant (dari subdomain/header)
   ├── Drizzle ORM
   │
   ├──▶ [Control Plane DB - Turso] (registry tenant, billing)
   └──▶ [Tenant DB #1, #2, #3, ... - Turso] (data operasional per toko)
```

---

## 7. Fitur Utama (Functional Requirements)

1. **Manajemen Produk** — CRUD produk, kategori, harga, SKU/barcode, varian sederhana, upload gambar; field menyesuaikan `business_mode` toko (retail/resto).
2. **Transaksi Kasir (Core POS)** — pencarian/scan produk, keranjang, diskon, split payment, void/refund (dengan approval), tipe order dasar (dine-in/takeaway untuk mode resto), cetak/kirim struk digital.
3. **Manajemen Inventory (Penuh)** — pengurangan stok otomatis saat transaksi, stok opname/adjustment manual, riwayat pergerakan stok per outlet, notifikasi stok menipis 🔸.
4. **Multi-Outlet** — 1 tenant mengelola banyak cabang; laporan bisa dilihat per-outlet atau gabungan; masing-masing outlet punya `business_mode` sendiri.
5. **Manajemen User & Role** — Owner, Kasir (dan Manajer Outlet jika dikonfirmasi); shift kasir dengan buka/tutup kas.
6. **Pembayaran** — tunai, QRIS (integrasi payment gateway 🔸 *provider belum ditentukan*), kembalian otomatis.
7. **Cetak Struk** — dukungan thermal printer (ESC/POS via WebUSB/Bluetooth) dan opsi struk digital.
8. **Sinkronisasi Offline↔Online** — sesuai Bagian 6.3, dengan indikator status sinkron di UI kasir.
9. **Laporan Lanjutan & Dashboard** — penjualan per periode, produk terlaris, margin per produk 🔸, perbandingan performa antar outlet, laporan per shift/kasir, export data.
10. **Onboarding Tenant** — pendaftaran mandiri, pemilihan mode toko (retail/resto), provisioning database otomatis, wizard setup toko pertama.
11. **Billing & Langganan (Tenant)** — kalkulasi tagihan flat-fee berdasarkan jumlah outlet aktif, riwayat & status pembayaran invoice, notifikasi jatuh tempo, penonaktifan otomatis outlet jika langganan tidak diperpanjang 🔸.

---

## 8. Non-Functional Requirements

| Kategori | Target |
|---|---|
| Performance | Transaksi lokal (offline) instan (<100ms); sinkron latar belakang tidak memblokir UI |
| Ketersediaan | Fungsi kasir offline harus tetap 100% berjalan tanpa internet |
| Keamanan | Isolasi data penuh antar tenant (DB terpisah), enkripsi token/kredensial di Control Plane |
| Skalabilitas biaya | Biaya server bertumbuh sebanding jumlah tenant aktif, bukan biaya tetap besar di awal |
| Kompatibilitas perangkat | PWA installable di Android, desktop (Windows/Mac); berjalan baik di perangkat kasir low-end |
| Auditabilitas | Setiap transaksi & perubahan stok tercatat dengan actor & timestamp |

---

## 9. Model Data (High-Level, per Tenant DB)

- `stores` (outlet — termasuk field `business_mode`: retail/resto, status aktif)
- `users` (staff + role)
- `products`, `categories`, `product_variants`
- `inventory_movements` (log perubahan stok, sumber: sale/adjustment/restock)
- `transactions`, `transaction_items`, `payments`
- `shifts` (buka/tutup kas per kasir)
- `sync_log` (opsional, untuk audit & debugging proses sinkronisasi)

Di **Control Plane DB** (terpisah, lintas-tenant):
- `tenants`, `tenant_db_credentials`
- `subscriptions` (tenant_id, harga per outlet, siklus tagihan, status)
- `billing_invoices` (dihitung dari jumlah `active_stores_count` saat siklus tagihan berjalan)

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Konflik data stok saat banyak kasir offline bersamaan | Stok tidak akurat | Sinkronisasi berbasis delta, bukan overwrite absolut |
| Kredensial DB tenant bocor dari Control Plane | Akses tidak sah ke data toko | Enkripsi at-rest, rotasi token, least-privilege token per tenant |
| Turso outage/limit rate pada banyak DB sekaligus | Sinkronisasi tertunda | Retry dengan backoff, antrian sinkron tetap tersimpan lokal (tidak hilang) |
| Jumlah koneksi DB tenant membengkak seiring pertumbuhan | Biaya/latensi naik | Connection pooling & caching koneksi, evaluasi migrasi tenant besar ke instance khusus jika perlu |
| Kasir menutup browser saat masih ada antrian sinkron | Data belum terkirim ke cloud | Background Sync API + validasi status sinkron sebelum tutup shift |

---

## 11. Metrik Keberhasilan (KPI Awal)

- Jumlah tenant aktif & tingkat retensi bulanan
- Rata-rata waktu onboarding tenant baru (target < 5 menit)
- Persentase transaksi yang terjadi dalam mode offline (menunjukkan value proposition terpakai)
- Waktu rata-rata sinkronisasi data setelah koneksi pulih
- Biaya infrastruktur per tenant aktif per bulan

---

## 12. Roadmap Awal (Indikatif)

| Fase | Fokus |
|---|---|
| Fase 0 | Setup arsitektur inti: multi-tenant provisioning, auth, billing dasar, skeleton Elysia + Next.js PWA |
| Fase 1 (MVP) | Seluruh fitur di Bagian 5.1 — mode retail/resto dasar, transaksi, inventory penuh, multi-outlet, laporan lanjutan, billing flat-fee, offline-sync |
| Fase 2 | Fitur F&B operasional lanjutan (manajemen meja, open bill, Kitchen Display System), integrasi payment gateway tambahan, role Manajer Outlet jika dibutuhkan |
| Fase 3 | Integrasi akuntansi, loyalty/membership, purchase order & manajemen supplier |

---

## 13. Asumsi & Pertanyaan Terbuka

Tiga keputusan utama (vertikal bisnis, cakupan fitur MVP, model bisnis) sudah dikonfirmasi dan tercermin di seluruh dokumen ini. Poin berikut masih perlu klarifikasi agar PRD bisa difinalkan sepenuhnya:

1. **Fitur F&B operasional lanjutan** (meja/table layout, open bill, Kitchen Display System): apakah harus masuk MVP, atau boleh menyusul di Fase 2 seperti diasumsikan di Bagian 5.2/12? Ini penting karena berdampak besar ke effort development.
2. **Payment gateway** untuk QRIS: provider spesifik (Midtrans, Xendit, dll) atau belum ditentukan?
3. **Mekanisme penagihan flat-fee ke tenant**: apakah owner harus bayar manual tiap bulan (transfer + konfirmasi manual oleh admin), atau ada auto-charge (kartu/VA) sejak awal? Ini memengaruhi kompleksitas modul billing di MVP.
4. **Cakupan role**: apakah "Manajer Outlet" dibutuhkan di MVP, atau cukup Owner + Kasir dulu?
5. **Strategi konflik data stok**: apakah pendekatan delta-sync di Bagian 6.3 bisa diterima, atau ada preferensi lain (misal: kunci stok per outlet, tidak boleh sold saat offline jika stok tidak pasti)?
6. **Provisioning tenant**: sepenuhnya self-service otomatis, atau tetap ada proses approval manual dari tim internal di awal?
7. **Format export laporan**: CSV, PDF, atau keduanya?

---

*Dokumen ini adalah draft awal. Silakan revisi Bagian 5, 12, dan 13 setelah menjawab pertanyaan klarifikasi.*

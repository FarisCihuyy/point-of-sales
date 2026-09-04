# Product Requirements Document (PRD)
## Sistem POS SaaS Multi-Tenant, Offline-First untuk Retail & F&B

| | |
|---|---|
| **Versi** | 1.0 (Comprehensive Specification) |
| **Tanggal** | 4 September 2026 |
| **Status** | Approved Specification — Mencakup modul Order Management, POS, Backoffice, Inventory, Table Management, dan Shifting/Presensi. |

---

## 1. Ringkasan Eksekutif

Produk ini adalah **platform Point of Sale (POS) & Backoffice Management berbasis SaaS Multi-Tenant** yang dirancang untuk mendukung operasional bisnis **Retail maupun Food & Beverage (F&B)** dalam satu platform terpadu.

Keunggulan utama produk:
1. **Arsitektur Offline-First:** Terminal kasir POS tetap dapat memproses transaksi, menyimpan order, dan mencetak struk secara lokal tanpa koneksi internet (menggunakan Dexie.js / IndexedDB), lalu secara otomatis mensinkronkan data ke cloud saat koneksi pulih.
2. **Fitur F&B & Retail Komprehensif:** Dilengkapi Order Management (QR Menu, Open/Split Bill, Payment Gateway, Reservasi), Visual Table Management, Manajemen Inventory terintegrasi (PO, Supplier, Distribusi antar outlet), serta Shifting & Absensi karyawan.
3. **Multi-Outlet & Multi-Tenant:** Isolasi data tingkat tinggi dengan strategi **database-per-tenant** (Turso libSQL), mendukung ekspansi multi-cabang dengan kontrol terpusat di Backoffice.

---

## 2. Latar Belakang & Masalah

Bisnis retail dan F&B skala UMKM hingga *mid-market* (1–20+ outlet) sering menghadapi kendala operasional:
1. **Ketergantungan Internet Penuh pada POS Cloud:** Saat jaringan putus, operasional kasir berhenti total, memicu antrian panjang dan potensi kehilangan omzet.
2. **Fragmentasi Aplikasi:** Pelaku usaha sering menggunakan aplikasi terpisah untuk POS, manajemen meja/reservasi, absensi staf, dan stok/distribusi antar outlet, sehingga data tidak sinkron dan biaya operasional membengkak.
3. **Kebutuhan Operasional F&B yang Dinamis:** Kebutuhan *QR Order*, *split bill*, *table layout*, *open bill*, dan *reservasi* belum terakomodasi dengan baik pada POS retail konvensional.
4. **Keamanan & Skalabilitas Data:** Risiko kebocoran data antar tenant pada sistem shared-database konvensional.

---

## 3. Tujuan Produk (Goals) & Batasan (Non-Goals)

### 3.1 Tujuan Produk (Goals)
- **Zero-Downtime POS:** Transaksi kasir tetap berjalan 100% lancar dalam kondisi offline.
- **End-to-End Operational Coverage:** Menyediakan solusi menyeluruh dari penerimaan pesanan (QR & Kasir), manajemen meja & reservasi, pembayaran digital, hingga manajemen inventaris dan presensi shift karyawan.
- **Isolasi & Keamanan Data Maksimal:** Database-per-tenant memastikan pemisahan data mutlak antar pengguna SaaS.
- **Multi-Outlet Control:** Pengelolaan katalog, stok, karyawan, dan laporan seluruh cabang dari satu Backoffice Dashboard.

### 3.2 Non-Goals
- Bukan sistem ERP akuntansi penuh (General Ledger, Jurnal penyesuaian kompleks, Asset Depreciation) — fokus pada Laporan Keuangan & Penjualan operasional kasir.
- Bukan aplikasi payroll penggajian otomatis (fokus pada penjadwalan shift dan pencatatan presensi/absensi).

---

## 4. Target Pengguna & Role Akses

| Role | Deskripsi & Hak Akses |
|---|---|
| **Tenant Owner** | Pemilik bisnis/usaha. Akses penuh ke seluruh outlet, billing SaaS, manajemen user, konfigurasi sistem, dan laporan analitik global. |
| **Manajer Outlet** | Bertanggung jawab atas operasional 1 atau beberapa outlet (stok opname, pembelian stok, distribusi, persetujuan void/refund, presensi & shift). |
| **Kasir (Cashier)** | Akses operasional terminal POS, buka/tutup shift kasir, transaksi penjualan, open/split bill, reservasi, cetak struk. |
| **Waitstaff / Server** | Akses terbatas untuk input pesanan meja (Order Management), status reservasi, dan cek denah meja. |
| **Super Admin (SaaS)** | Tim internal platform SaaS — provisioning tenant, monitoring kesehatan DB, subscription, billing platform. |

---

## 5. Cakupan & Spesifikasi Fitur Utama

Sistem dikelompokkan ke dalam **6 Pilar Fitur Utama**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PLATFORM FITUR POS SAAS                                   │
├─────────────────────┬─────────────────────┬────────────────────┬───────────────────────┤
│ 1. ORDER MANAGEMENT │ 2. POINT OF SALES   │ 3. BACKOFFICE      │ 4. INVENTORY          │
│  - QR Menu Order    │  - POS Digital      │  - Dashboard       │  - Daftar Stok        │
│  - Open/Close Bill  │  - Laporan Keuangan │  - Kelola Karyawan │  - Stok Opname        │
│  - Save/Split Bill  │  - Laporan Penjualan│  - Inventory Hub   │  - Pembelian Stok     │
│  - Cetak Struk      │  - Menu Order       │  - Multi-Outlet    │  - Daftar Pemasok     │
│  - Kelola Pesanan   │  - Data Pelanggan   │                    │  - Distribusi Stok    │
│  - Payment Gateway  │  - Reservasi (POS)  │                    │                       │
│  - Kelola Reservasi │                     │                    │                       │
├─────────────────────┴─────────────────────┴────────────────────┴───────────────────────┤
│ 5. TABLE MANAGEMENT (Floor/Table Layout & Status)                                      │
│ 6. SHIFTING & PRESENSI (Atur Shift, Absensi Staf, Laporan Absensi & Shift)             │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.1. Modul Order Management

Modul untuk menangani siklus hidup pesanan secara fleksibel dari pemesanan hingga pembayaran:

1. **QR Menu Order:**
   - Halaman menu digital responsif (mobile-web) berbasis QR Code per meja atau outlet.
   - Pelanggan dapat melihat katalog, foto, deskripsi, varian/add-on, serta catatan khusus pesanan.
   - Pesanan langsung terkirim ke antrian POS kasir / dapur secara real-time.
2. **Open / Close Bill:**
   - Mendukung sistem pesanan berjalan (*tab/dine-in*).
   - Kasir/pelayan dapat menambahkan item pesanan susulan ke tagihan yang sama sebelum bill ditutup.
   - Perhitungan otomatis subtotal, pajak, dan service charge saat penutupan tagihan.
3. **Save / Split Bill:**
   - **Save Bill (Hold Order):** Menyimpan transaksi sementara untuk melayani pelanggan berikutnya tanpa menghapus antrian.
   - **Split Bill:** Pemecahan tagihan fleksibel:
     - *Split by Item:* Memilih item tertentu untuk dibayar terpisah.
     - *Split Equally:* Membagi rata total tagihan ke beberapa pembayaran.
     - *Split by Custom Amount:* Pembayaran parsial nominal tertentu.
4. **Cetak Struk:**
   - Pencetakan struk tagihan (receipt) dan tiket pesanan dapur/bar (order checker).
   - Dukungan thermal printer (ESC/POS) via Web Bluetooth, Web USB, dan Network/IP Printer.
   - Opsi pengiriman struk digital (WhatsApp / Email / QR e-receipt).
5. **Kelola Pesanan (Order Lifecycle Management):**
   - Manajemen status pesanan: `Pending` → `In Preparation` → `Ready` → `Completed` / `Void`.
   - Filter pesanan berdasarkan tipe order: *Dine-in*, *Takeaway*, *Delivery*, atau *QR Order*.
6. **Integrasi Payment Gateway:**
   - Pembayaran digital otomatis: QRIS Dinamis/Statis, Virtual Account (BCA, Mandiri, BRI, BNI), E-Wallet (GoPay, OVO, ShopeePay, DANA), dan Kartu Debit/Kredit.
   - Webhook callback instan untuk konfirmasi pembayaran lunas secara otomatis tanpa verifikasi manual.
7. **Manajemen Reservasi:**
   - Booking meja/area dengan detail: nama pelanggan, kontak, waktu kedatangan, jumlah pax, dan nomor meja yang ditentukan.
   - Pencatatan uang muka (Down Payment / DP) yang otomatis memotong total tagihan saat kedatangan.
   - Status reservasi: `Booked`, `Confirmed`, `Seated / Checked-in`, `Cancelled`, `No-show`.

---

### 5.2. Modul Point Of Sales (POS)

Terminal kasir utama dengan kecepatan tinggi, ergonomis, dan berorientasi offline-first:

1. **POS Digital (Core Cashier):**
   - Tampilan kasir sentuh cepat dengan katalog visual, kategori tab, dan barcode scanner.
   - Input diskon (persentase / nominal) per item atau total transaksi.
   - Multi-metode pembayaran: Tunai (kalkulator kembalian cepat), Non-Tunai, dan Split Payment.
   - Beroperasi penuh saat offline; transaksi tersimpan di Dexie.js dan tersinkronisasi otomatis saat online.
2. **Laporan Keuangan (Kasir & Operasional):**
   - Ringkasan arus kas masuk/keluar kasir (Cash In / Cash Out).
   - Rekapitulasi per metode pembayaran (Tunai, QRIS, Kartu, Transfer).
   - Perhitungan total pajak daerah (PB1), PPN, dan service charge yang terkumpul.
3. **Laporan Penjualan:**
   - Rekap penjualan harian, mingguan, dan kustom per periode.
   - Analitik produk terlaris (*best seller*), kategori paling diminati, dan margin kotor.
   - Laporan penjualan per kasir dan per outlet.
4. **Menu Order (POS Catalog & Modifier):**
   - Navigasi menu cepat, varian ukuran/rasa, extra topping/modifier, dan custom order notes.
   - Indikator ketersediaan stok real-time langsung pada kartu produk.
5. **Data Pelanggan (Customer Management):**
   - Pencatatan data pelanggan (Nama, Nomor Telepon/WhatsApp, Email, Catatan).
   - Riwayat transaksi pelanggan dan total pengeluaran untuk personalisasi layanan.
6. **Reservasi di Layar POS:**
   - Akses cepat daftar reservasi hari ini langsung dari layar POS.
   - Check-in pelanggan reservasi dalam 1 klik langsung mengaktifkan meja dan membuka bill baru.

---

### 5.3. Modul Backoffice

Pusat kendali dan administrasi tenant:

1. **Dashboard Eksekutif:**
   - Metrik utama: Total Omzet, Total Transaksi, Rata-rata Nilai Transaksi (*AOV*), dan Tren Penjualan.
   - Grafik performa antar outlet (*outlet benchmark*).
   - Widget peringatan stok menipis (*low-stock alerts*) dan ringkasan absensi hari ini.
2. **Manajemen Karyawan (Staff Management):**
   - Tambah, edit, dan nonaktifkan akun karyawan.
   - Pengaturan role & permission (Owner, Manajer, Kasir, Waiter).
   - Pengaturan PIN akses cepat untuk terminal POS.
3. **Inventory Hub (Overview):**
   - Tampilan terpusat ketersediaan stok seluruh cabang.
   - Log mutasi dan riwayat penyesuaian stok global.
4. **Manajemen Multi Outlet:**
   - Pembuatan dan konfigurasi profil cabang baru (Nama, Alamat, Kontak, Mode Bisnis: Retail / Resto).
   - Pengaturan spesifik per outlet: tarif pajak, service charge, header/footer struk, dan zona waktu.

---

### 5.4. Modul Inventory

Sistem pengelolaan persediaan bahan baku dan barang jadi yang akurat:

1. **Daftar Stok (Stock Master):**
   - Pengelolaan master barang & bahan baku: SKU, Barcode, Kategori, Satuan Unit (UOM: Pcs, Kg, Liter, Pack, dsb).
   - Pengaturan batas minimum stok (*reorder point / safety stock*).
   - Harga beli rata-rata (*cost price*) dan harga jual per outlet.
2. **Stok Opname (Stock Adjustment):**
   - Form pencocokan stok fisik berkala per outlet.
   - Pencatatan selisih (discrepancy) otomatis dengan alasan: rusak, kedaluwarsa, hilang, atau koreksi hitung.
   - Log audit siapa yang melakukan opname beserta waktu eksekusi.
3. **Pembelian Stok (Purchase Order / Restock):**
   - Pembuatan dokumen Purchase Order (PO) ke pemasok.
   - Tracking status PO: `Draft` → `Submitted` → `Partial Received` → `Fully Received` → `Completed`.
   - Penerimaan barang otomatis menambah kuantitas stok di outlet terkait.
4. **Daftar Pemasok (Supplier Management):**
   - Database vendor/pemasok: nama perusahaan, kontak, email, alamat, termin pembayaran (Tempo/Cash).
   - Riwayat pembelian dan riwayat pasokan per pemasok.
5. **Distribusi Stok (Stock Transfer / Mutasi Antar Cabang):**
   - Permintaan dan pengiriman transfer stok antar cabang atau dari gudang pusat ke outlet.
   - Alur status transfer: `Requested` → `In-Transit` → `Received & Verified`.
   - Validasi penerimaan untuk memastikan kuantitas yang dikirim sesuai dengan yang diterima.

---

### 5.5. Modul Table Management

Pengaturan tata letak dan status meja khusus operasional F&B:

1. **Floor & Table Management:**
   - Pengaturan area / lantai (Lantai 1, Lantai 2, Indoor, Outdoor, VIP, Bar).
   - Visualisasi denah meja interaktif dengan penomoran dan kapasitas kursi (pax).
   - Status meja real-time dengan kode warna:
     - **Hijau (Available):** Meja kosong siap digunakan.
     - **Biru (Occupied):** Sedang digunakan dengan transaksi aktif berjalan.
     - **Kuning (Reserved):** Meja telah dipesan untuk jadwal reservasi tertentu.
     - **Abu-abu / Merah (Billing / Cleaning):** Menunggu pembayaran atau proses pembersihan.
   - Fitur operasional meja:
     - **Assign Table:** Hubungkan pesanan/bill ke nomor meja.
     - **Move Table:** Pindahkan pesanan aktif dari satu meja ke meja lain tanpa mengubah isi bill.
     - **Merge Tables:** Menggabungkan 2 atau lebih meja untuk rombongan besar dalam 1 bill transaksi.

---

### 5.6. Modul Shifting & Presensi (Shifting)

Pengelolaan jam kerja, giliran kerja (shift), dan pencatatan kehadiran karyawan:

1. **Atur Shift Karyawan:**
   - Pembuatan master jadwal shift (contoh: Shift Pagi: 07:00–15:00, Shift Sore: 15:00–23:00).
   - Penjadwalan mingguan/bulanan staf per outlet.
   - Penugasan karyawan ke jadwal shift tertentu.
2. **Absensi (Clock-in / Clock-out):**
   - Staf melakukan presensi masuk (Clock-in) dan presensi keluar (Clock-out) via terminal POS atau aplikasi web.
   - Validasi absensi dengan PIN karyawan dan pencatatan waktu presisi.
3. **Laporan Absensi:**
   - Rekap kehadiran berkala per karyawan atau per outlet.
   - Rekap status: Tepat Waktu, Terlambat (*Late In*), Pulang Cepat (*Early Out*), Izin, dan Tanpa Keterangan (*Absent*).
   - Export data absensi ke format Excel / CSV.
4. **Laporan Absensi Tiap Shift (Shift & Cash Reconciliation):**
   - Laporan presensi yang terhubung langsung dengan sesi kasir per shift.
   - Rekonsiliasi modal awal kas (*starting cash*), total transaksi kas per shift, kas keluar, dan saldo akhir kas (*ending cash*).
   - Deteksi selisih kas fisik (*cash discrepancy / overage / shortage*) saat penutupan shift.

---

## 6. Arsitektur Teknis & Sinkronisasi

### 6.1 Stack Teknologi
- **Backend API:** ElysiaJS v1.4 di atas Bun runtime (`apps/api`)
- **Frontend App:** Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui (`apps/web`)
- **State & Data Fetching:** TanStack Query v5, TanStack Table v9, TanStack Form v1
- **Offline Storage:** Dexie.js (IndexedDB wrapper)
- **Database & ORM:** Turso (libSQL / distributed SQLite) dengan Drizzle ORM
- **Shared Package:** `@repo/shared` (Zod schemas, DTOs, dan TypeScript contracts)

### 6.2 Strategi Multi-Tenant & Database-per-Tenant
1. **Control Plane Database:** Menyimpan data registry tenant, kredensial DB Turso terisolasi per tenant, status subscription, dan billing SaaS.
2. **Tenant Database (Per Toko/Brand):** Satu database Turso khusus untuk tiap tenant yang memuat seluruh data operasional (outlet, produk, transaksi, stok, meja, shift, absensi).
3. **Dynamic Tenant Resolver:** Middleware ElysiaJS mendeteksi tenant via subdomain atau header `X-Tenant-ID` dan mengarahkan koneksi Drizzle ke database tenant yang bersangkutan secara dinamis.

### 6.3 Mekanisme Offline-First & Sinkronisasi Data
- **Local-First Write:** Seluruh transaksi POS, perubahan status meja lokal, dan buka/tutup shift ditulis instan ke IndexedDB (Dexie.js).
- **Sync Queue Background Worker:** Service Worker dan sinkronisasi berkala mengirim antrian data ke ElysiaJS API saat koneksi internet aktif.
- **Idempotency:** Setiap transaksi memiliki `client_generated_id` (UUID v4) untuk mencegah duplikasi data saat sinkronisasi berulang.
- **Delta-Based Stock Mutation:** Pengurangan dan penambahan stok dikirim dalam bentuk delta (`quantity_delta: -2`) untuk mencegah konflik *concurrency* antar terminal offline.

---

## 7. Model Data Ringkas (Tenant Database)

Berikut entitas utama yang ada pada setiap database tenant:

| Kategori | Tabel-Tabel Utama |
|---|---|
| **Core & Outlets** | `stores`, `users`, `roles`, `app_settings` |
| **Produk & Menu** | `products`, `categories`, `product_variants`, `modifiers`, `product_prices` |
| **Pesanan & Transaksi** | `orders`, `order_items`, `bills`, `transactions`, `payments`, `payment_callbacks` |
| **Meja & Reservasi** | `floor_areas`, `tables`, `reservations` |
| **Inventory & Supplier** | `inventory_items`, `stock_levels`, `stock_movements`, `stock_opnames`, `stock_opname_items`, `suppliers`, `purchase_orders`, `purchase_order_items`, `stock_transfers`, `stock_transfer_items` |
| **Pelanggan** | `customers`, `customer_addresses` |
| **Shift & Presensi** | `shifts`, `shift_schedules`, `attendances`, `cashier_sessions` |
| **Audit & Sync** | `sync_logs`, `audit_trails` |

---

## 8. Non-Functional Requirements (NFR)

| Parameter | Spesifikasi & Target |
|---|---|
| **Kecepatan Respon POS** | Input item ke keranjang dan kalkulasi transaksi < 50ms dalam mode offline lokal. |
| **Ketahanan Jaringan** | POS kasir dapat beroperasi offline 100% tanpa batas waktu untuk pencatatan transaksi kas & cetak struk lokal. |
| **Keamanan & Isolasi** | Pemisahan database fisik antar tenant via Turso; otentikasi JWT / session terenkripsi; Role-Based Access Control ketat. |
| **Skalabilitas Biaya** | Biaya infrastruktur bertambah secara linier berdasarkan jumlah tenant aktif (Database-per-tenant on Turso serverless). |
| **Kompatibilitas Hardware** | Dukungan web responsive & PWA untuk tablet Android, iPad, PC desktop kasir, serta printer thermal 58mm/80mm (ESC/POS). |
| **Integritas Data** | Jaminan zero data loss pada transaksi offline dengan mekanisme *retry exponential backoff* dan log audit sinkronisasi. |

---

## 9. Roadmap Pengembangan

| Tahap | Milestone & Fokus Modul |
|---|---|
| **Fase 1: Core Foundation & POS** | Multi-tenant setup, Auth, Master Produk & Kategori, Terminal POS Digital Offline-First, Transaksi Tunai/Non-Tunai, Cetak Struk, Laporan Penjualan Dasar. |
| **Fase 2: Order Management & F&B Operations** | Floor & Table Management, QR Menu Order, Open/Close Bill, Save/Split Bill, Integrasi Payment Gateway (QRIS/VA), Reservasi. |
| **Fase 3: Advanced Inventory & Supply Chain** | Master Pemasok (Suppliers), Pembelian Stok (PO), Stok Opname dengan approval, Distribusi/Transfer Stok Antar Outlet. |
| **Fase 4: Shifting, Absensi & Analytics** | Penjadwalan Shift, Absensi Staf via POS/Web, Laporan Absensi & Rekonsiliasi Kas per Shift, Laporan Keuangan Komprehensif & Dashboard Eksekutif. |

---

*Dokumen ini merupakan spesifikasi acuan resmi (Source of Truth) untuk implementasi arsitektur, database schema, dan antarmuka UI/UX sistem POS SaaS.*

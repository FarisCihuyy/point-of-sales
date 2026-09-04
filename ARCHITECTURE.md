# Architecture Overview — POS SaaS Multi-Tenant & Offline-First

> **Living document.** Perbarui setiap kali ada perubahan arsitektur signifikan.
> **Scope:** Platform POS (Point of Sale) SaaS multi-tenant untuk Retail & F&B dengan kapabilitas offline-first.

---

## 1. Tech Stack

### Monorepo & Workspace
| Layer | Teknologi |
| --- | --- |
| Monorepo Tool | Turborepo |
| Package Manager & Runtime | Bun (`bun@1.3.14`) |
| Workspace Structure | `apps/web`, `apps/api`, `packages/shared`, `packages/ui` |

### Apps & Packages
| App / Package | Layer | Teknologi Utama |
| --- | --- | --- |
| `apps/web` | Frontend Web / PWA | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, TanStack Query v5, TanStack Table v9, TanStack Form v1, Dexie.js (IndexedDB offline) |
| `apps/api` | Backend API | ElysiaJS v1.4, Bun runtime, Drizzle ORM, Swagger/OpenAPI, CORS |
| `packages/ui` | Shared UI Design System | Tailwind CSS v4, Radix UI Primitives, shadcn/ui components |
| `packages/shared` | Shared Schemas & Types | TypeScript, Zod, Drizzle inference schemas, global contracts |
| Database | Multi-Tenant Database | Turso (libSQL / distributed SQLite) — Database-per-Tenant + Control Plane DB |

---

## 2. Prinsip Arsitektur Monorepo

```
┌─────────────────────────────────────────────────────────────┐
│                    TURBOREPO MONOREPO                       │
│                                                             │
│  apps/web (Next.js PWA)          apps/api (ElysiaJS API)    │
│  ├─ Feature-Based Architecture   ├─ Tenant Middleware       │
│  ├─ Offline-First (Dexie.js)     ├─ Dynamic DB Connection   │
│  └─ TanStack Query / Table       └─ Drizzle ORM             │
│            │                               │                │
│            ▼                               ▼                │
│  packages/ui                     packages/shared            │
│  (Design system & primitives)    (Schemas, DTOs & Types)    │
└─────────────────────────────────────────────────────────────┘
```

1. **Database-per-Tenant Isolation:** Setiap tenant memiliki database Turso terpisah. Tidak ada risiko kebocoran data (*noisy neighbor* & cross-tenant data leak).
2. **Local-First / Offline-First:** Kasir di `apps/web` menulis transaksi langsung ke IndexedDB (Dexie.js). Transaksi tidak boleh gagal hanya karena koneksi terputus.
3. **Feature-Based Architecture (Web):** Seluruh logika UI, data-fetching, dan state frontend dikelompokkan berdasarkan modul domain bisnis di `apps/web/src/features/`.
4. **Idempotent Sync:** Transaksi menggunakan `client_generated_id` (UUID) dan mutasi stok berbasis delta (`quantity_delta`) untuk sinkronisasi yang aman dan anti-duplikasi.

---

## 3. Struktur Monorepo & Folder

```
point-of-sales/
├── apps/
│   ├── api/                                # Backend API Service (ElysiaJS + Bun)
│   │   ├── drizzle/                        # Drizzle migration files
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── index.ts                # Database connection factory (Turso)
│   │   │   │   └── schema/
│   │   │   │       ├── control-plane.ts    # Central registry: tenants, credentials, billing
│   │   │   │       └── template.ts         # Tenant DB template (migrated to new tenant DBs)
│   │   │   ├── middleware/
│   │   │   │   └── tenant.ts               # Resolve tenant by subdomain or X-Tenant-ID
│   │   │   ├── modules/                    # Feature-based domain modules (Elysia MVC pattern)
│   │   │   │   ├── auth/                   # Auth module
│   │   │   │   │   ├── index.ts            # Elysia Controller (HTTP routing, validation, cookies)
│   │   │   │   │   ├── service.ts          # Business logic (decoupled from controller)
│   │   │   │   │   └── model.ts            # TypeBox validation models & DTOs
│   │   │   │   ├── user/                   # User / Staff module (index.ts, service.ts, model.ts)
│   │   │   │   ├── store/                  # Store / Outlet module (index.ts, service.ts, model.ts)
│   │   │   │   ├── category/               # Category module (index.ts, service.ts, model.ts)
│   │   │   │   ├── product/                # Product module (index.ts, service.ts, model.ts)
│   │   │   │   └── health/                 # Health check module
│   │   │   ├── utils/                      # Shared API utilities (response, crypto, currency, etc.)
│   │   │   └── index.ts                    # Elysia server entrypoint
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   └── web/                                # Frontend Application (Next.js App Router)
│       ├── public/                         # Static assets & PWA manifest / service workers
│       └── src/
│           ├── app/                        # Thin routing layer (Next.js App Router)
│           │   ├── (auth)/                 # Public auth route group
│           │   │   └── login/
│           │   │       └── page.tsx        # Login page
│           │   ├── (dashboard)/            # Protected backoffice / management route group
│           │   │   ├── layout.tsx          # Backoffice layout with sidebar & auth guard
│           │   │   ├── page.tsx            # Redirect to /reports or /pos
│           │   │   ├── inventory/          # Stock opname & movement history
│           │   │   ├── products/           # Catalog, category, and variant management
│           │   │   ├── stores/             # Multi-outlet management (retail / resto mode)
│           │   │   ├── shifts/             # Shift open/close tracking
│           │   │   ├── transactions/       # Transaction history & refund
│           │   │   ├── reports/            # Analytics & sales metrics
│           │   │   ├── billing/            # SaaS subscription & invoice flat-fee
│           │   │   └── settings/           # Store & printer settings
│           │   ├── pos/                    # Fullscreen Cashier POS terminal
│           │   │   └── page.tsx            # POS cash register interface
│           │   ├── globals.css
│           │   └── layout.tsx
│           │
│           ├── features/                   # Feature-based domain modules
│           │   ├── auth/                   # Staff & Owner authentication
│           │   │   ├── components/
│           │   │   ├── hooks/
│           │   │   └── types/
│           │   ├── pos/                    # Core Cashier terminal
│           │   │   ├── components/         # Cart, product grid, payment modal, receipt modal
│           │   │   ├── hooks/              # useCart, useScanner, useReceiptPrinter
│           │   │   └── types/
│           │   ├── sync/                   # Offline sync engine
│           │   │   ├── db/                 # Dexie.js IndexedDB schema & sync queue
│           │   │   ├── hooks/              # useOnlineStatus, useSyncQueue
│           │   │   └── services/           # Sync scheduler & delta conflict handler
│           │   ├── inventory/              # Stock movements, restock, adjustments
│           │   │   ├── components/
│           │   │   ├── hooks/
│           │   │   └── api/
│           │   ├── products/               # Product catalog, categories, variants
│           │   │   ├── components/
│           │   │   ├── hooks/
│           │   │   └── api/
│           │   ├── stores/                 # Outlet setup, business_mode (retail/resto)
│           │   │   ├── components/
│           │   │   ├── hooks/
│           │   │   └── api/
│           │   ├── shifts/                 # Shift management & cash reconciliation
│           │   │   ├── components/
│           │   │   └── hooks/
│           │   ├── transactions/           # Sales receipts, void, and audit
│           │   │   ├── components/
│           │   │   └── hooks/
│           │   ├── reports/                # Sales metrics, top items, outlet comparison
│           │   │   ├── components/
│           │   │   └── hooks/
│           │   └── billing/                # Subscription & per-outlet flat-fee invoices
│           │       ├── components/
│           │       └── hooks/
│           │
│           ├── components/                 # App-specific shared components
│           │   ├── layout/                 # App sidebar, header, navigation
│           │   └── shared/                 # DataTable, EmptyState, ConfirmDialog
│           ├── hooks/                      # Shared custom hooks (useOnline, useDebounce)
│           ├── lib/                        # API client, Dexie instance, utils
│           └── stores/                     # UI global stores (Zustand)
│
├── packages/
│   ├── shared/                             # Shared contracts & types across apps
│   │   └── src/
│   │       ├── schemas/                    # Zod validation schemas
│   │       ├── types/                      # Universal DTOs & models
│   │       └── index.ts
│   │
│   └── ui/                                 # Shared Design System
│       └── src/
│           ├── components/                 # Primitives (button, card, dialog, table, input)
│           └── lib/                        # utils (cn, class-variance-authority)
│
├── turbo.json
└── package.json
```

---

## 4. Feature-Based Architecture (Website / `apps/web`)

Aliran data `apps/web` bersifat **unidirectional**:

```
packages/ui & packages/shared
    ↓
src/components/shared & src/lib
    ↓
src/features/[feature-name] (Domain UI, Hooks, Local Store, Dexie/API)
    ↓
src/app/[routes] (Thin routing layer)
```

### Aturan Wajib Web:

1. **`src/app/` hanya berisi routing:** Page component tidak boleh memuat query database atau logika bisnis berat secara langsung.
2. **Feature Isolation:** Satu feature **tidak boleh import** dari feature lain secara langsung. Komposisi antar feature dilakukan di level `src/app/` atau diekstrak ke shared components/hooks jika reusable.
3. **Shared Hierarchy:** `packages/ui` dan `src/components/shared` tidak boleh import dari `src/features/` atau `src/app/`.
4. **Offline Resilience:** Komponen kasir/POS membaca dari cache Dexie.js terlebih dahulu, bukan langsung memblokir saat fetch API gagal.

```tsx
// ✅ Benar — apps/web/src/app/(dashboard)/products/page.tsx
import { ProductsPage } from "@/features/products/components/products-page";

export default function Page() {
  return <ProductsPage />;
}
```

---

## 5. Strategi Multi-Tenant & Database (Turso + Drizzle)

### 5.1 Database-per-Tenant

Arsitektur database dipisah menjadi dua tingkatan:

#### 1. Control Plane Database (Pusat)
- **`tenants`**: Data pelanggan SaaS (nama toko/usaha, slug/subdomain, email owner, status).
- **`tenant_db_credentials`**: Connection string (`dbUrl`), nama database Turso, dan enkripsi auth token database per tenant.
- **`subscriptions`**: Paket langganan flat-fee bulanan per outlet aktif (`price_per_store`).
- **`billing_invoices`**: Tagihan bulanan yang dihitung otomatis dari `active_stores_count * price_per_store`.

#### 2. Tenant Database (Per-Tenant / Database Template)
Setiap tenant yang mendaftar di-provision database Turso baru dengan migrasi skema:
- **`stores`**: Multi-outlet cabang tenant. Memiliki field `business_mode: 'retail' | 'resto'` dan `is_active`.
- **`users`**: Staff tenant (`role: 'owner' | 'cashier'`). `store_id = null` menunjukkan owner dapat mengakses semua outlet.
- **`categories` & `products` & `product_variants`**: Master katalog produk dan varian (harga, SKU, barcode, harga dinamis).
- **`inventory_movements`**: Log pergerakan stok (alasan: `sale`, `adjustment`, `restock`, `return`) dengan `quantity_delta`.
- **`shifts`**: Buka/tutup shift kasir beserta rekonsiliasi kas (`opening_cash`, `closing_cash`).
- **`transactions` & `transaction_items` & `payments`**: Data penjualan kasir dengan `client_generated_id` (UUID) dan order type (`dine_in`, `takeaway`, `regular`).

---

## 6. Offline-First & Sinkronisasi Data

```
┌────────────────────────────────────────────────────────┐
│                   POS CLIENT (PWA)                     │
│                                                        │
│  [ Kasir Input Transaksi ]                             │
│             │                                          │
│             ▼                                          │
│  [ 1. Write ke Dexie.js (IndexedDB) ]  ──▶ UI Respons  │
│  [ 2. Push ke Local Sync Queue ]          Instant      │
└───────────────────────┬────────────────────────────────┘
                        │
                  (Saat Online)
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│                   ELYSIA API SERVER                    │
│                                                        │
│  [ Batch Sync Endpoint ]                               │
│  ├─ Verifikasi Idempotency (Transaction UUID)          │
│  ├─ Catat Transaksi ke Tenant DB                       │
│  └─ Terapkan Delta Stok (quantity_delta)               │
└────────────────────────────────────────────────────────┘
```

1. **Local-First Writes:** Transaksi kasir langsung disimpan ke Dexie.js. Kasir tidak perlu menunggu response HTTP untuk menyelesaikan penjualan atau mencetak struk.
2. **Idempotency via Client UUID:** ID transaksi di-generate di client (`crypto.randomUUID()`). Jika sync dikirim ulang (retry), backend memeriksa apakah ID sudah ada untuk mencegah duplikasi nota.
3. **Delta Stock Movements:** Pengurangan stok disinkronkan sebagai delta (`quantity_delta = -2`), bukan stok absolut (`stock = 10`), sehingga multi-kasir offline tidak saling menimpa (*lost updates* dicegah).
4. **Background Sync:** Menggunakan Web Background Sync / queue runner di client untuk memproses antrian saat koneksi internet kembali stabil.

---

## 7. Role & Hak Akses

| Area / Fitur | Owner | Cashier | Super Admin (SaaS Provider) |
| --- | :---: | :---: | :---: |
| POS Terminal (Kasir) | ✅ | ✅ | ❌ |
| Buka / Tutup Shift | ✅ | ✅ | ❌ |
| Kelola Produk & Kategori | ✅ | ❌ (View Only) | ❌ |
| Stok Opname / Penyesuaian | ✅ | ❌ | ❌ |
| Manajemen Outlet & Mode Toko | ✅ | ❌ | ❌ |
| Laporan Penjualan & Margin | ✅ | ❌ | ❌ |
| Billing & Invoice SaaS | ✅ | ❌ | ❌ |
| Provisioning & Monitor Tenant | ❌ | ❌ | ✅ (via Control Plane) |

---

## 8. Panduan Menambah Feature Baru (Frontend)

Misal membuat fitur **Discounts / Promosi Toko**:

```bash
# 1. Buat folder domain di apps/web/src/features/discounts/
apps/web/src/features/discounts/
├── api/
│   ├── get-discounts.ts
│   └── create-discount.ts
├── components/
│   ├── discounts-page.tsx
│   ├── discount-table.tsx
│   └── discount-form.tsx
├── hooks/
│   └── use-discounts.ts
└── types/
    └── index.ts

# 2. Definisikan Zod schema di packages/shared/src/schemas/discounts.ts
# 3. Buat routing tipis di apps/web/src/app/(dashboard)/discounts/page.tsx
# 4. Tambahkan route ke navigation sidebar di apps/web/src/components/layout/
```

---

## 9. Environment Variables

### Backend (`apps/api/.env`)
```bash
PORT=3001
TURSO_CONTROL_PLANE_DB_URL=libsql://...
TURSO_CONTROL_PLANE_AUTH_TOKEN=...
TURSO_API_TOKEN=...              # Untuk automated provisioning database tenant baru
TURSO_ORG_SLUG=...
ENCRYPTION_KEY=...               # Enkripsi kredensial auth token tenant di DB
```

### Frontend (`apps/web/.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_DOMAIN=pos.local
```

---

## 10. Glossary

| Term | Definisi |
| --- | --- |
| **Tenant** | Satu entitas bisnis/pelanggan SaaS yang memiliki 1 database Turso terpisah. |
| **Store (Outlet)** | Cabang fisik milik tenant (bisa berjumlah 1 atau banyak per tenant). |
| **Business Mode** | Mode operasional toko (`retail` atau `resto`), menentukan penyesuaian UI & field pesanan. |
| **Control Plane DB** | Database pusat penyimpan registri tenant, kredensial koneksi DB, dan data tagihan flat-fee. |
| **Tenant DB** | Database terisolasi per tenant yang menyimpan seluruh transaksi, produk, dan stok outlet. |
| **Local-First** | Pola arsitektur di mana data ditulis ke storage lokal perangkat terlebih dahulu sebelum disinkronkan ke server. |
| **Quantity Delta** | Perubahan jumlah stok relatif (+ / -) untuk memastikan konsistensi mutasi stok saat sinkronisasi offline. |

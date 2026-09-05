# Point of Sales (POS) Monorepo

Monorepo arsitektur modern untuk sistem Point of Sales (POS) multi-tenant, mencakup backend API (ElysiaJS + Drizzle ORM + Turso/LibSQL) dan frontend Web (Next.js 16 + TailwindCSS v4 + `@repo/ui`).

---

## 📦 Cara Menambahkan Komponen UI Baru (shadcn)

Komponen UI bersama dikelola secara terpusat di dalam package **`@repo/ui`** (`packages/ui`).

### 1. Cara Cepat (Rekomendasi)

Jalankan perintah berikut langsung dari direktori `packages/ui`:

```bash
# Pindah ke folder packages/ui
cd packages/ui

# Install komponen shadcn (contoh: tabs, popover, switch, accordion)
bunx --bun shadcn@latest add <nama-komponen>

# Contoh:
bunx --bun shadcn@latest add tabs
bunx --bun shadcn@latest add popover
```

### 2. Dari Root Monorepo

Jika ingin menjalankan dari root tanpa berpindah folder, arahkan flag config `-c` ke `packages/ui`:

```bash
bunx --bun shadcn@latest add <nama-komponen> -c ./packages/ui

# Contoh:
bunx --bun shadcn@latest add tabs -c ./packages/ui
```

> [!NOTE]
> File komponen yang baru di-generate akan otomatis masuk ke folder `packages/ui/src/components/ui/` dan langsung dapat diimpor dari `@repo/ui/ui/<nama-komponen>` atau `@repo/ui/components/ui/<nama-komponen>`.

---

## 🧩 Daftar Komponen Primitif yang Sudah Terpasang

Saat ini di `packages/ui/src/components/ui/` sudah tersedia:
- `avatar`
- `badge`
- `breadcrumb`
- `button`
- `card`
- `collapsible`
- `dialog`
- `dropdown-menu`
- `field`
- `input`
- `input-otp`
- `label`
- `select`
- `separator`
- `sheet`
- `sidebar`
- `skeleton`
- `table`
- `tooltip`

---

## 🚀 Menjalankan Project

### 1. Install Dependencies
```bash
bun install
```

### 2. Jalankan Dev Server (Semua Apps & Packages)
```bash
bun dev
```

- **Frontend (Web/POS/Dashboard)**: `http://localhost:3000`
- **Backend API (ElysiaJS)**: `http://localhost:3001` (Swagger Docs: `http://localhost:3001/swagger`)

---

## 🛠️ Scripts Monorepo

| Command | Deskripsi |
| :--- | :--- |
| `bun dev` | Menjalankan seluruh aplikasi dalam mode development (Turborepo) |
| `bun build` | Membangun seluruh aplikasi untuk production |
| `bun lint` | Menjalankan linter pada seluruh workspace |
| `bun typecheck` | Menjalankan validasi TypeScript di semua package |
| `bun db:generate` | Generate migrasi schema Drizzle |
| `bun db:migrate` | Menjalankan migrasi Drizzle ke database |

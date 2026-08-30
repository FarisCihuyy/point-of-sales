# DESIGN.md — POS SaaS Multi-Tenant & Offline-First Design System

> Baca file ini sebelum membuat atau mengedit UI apapun.
> Ini adalah **design contract** yang harus diikuti oleh semua developer dan AI agent.
> Mengacu langsung pada styling token di `apps/web/src/app/globals.css` dan `@repo/ui`.

---

## 1. Product Feel & Surface Archetypes

**Kategori:** B2B SaaS POS (Point of Sale) & Backoffice Management  
**Pengguna:** Tenant Owner, Kasir (Cashier), Super Admin SaaS  
**Surface Types:**
1. **Backoffice Dashboard:** Data-dense, analytics, inventory, multi-outlet settings, dan billing.
2. **POS Cashier Terminal:** High-speed interaction, touch-friendly, offline-resilient, keypad angka cepat, keranjang belanja responsif, dan modal cetak struk thermal.

**Prinsip Desain:**
- **High Ergonomics & Speed:** Kasir butuh tombol besar, kontras tinggi, feedback instan, dan alur checkout minimal klik.
- **Offline Transparency:** Status koneksi (Online/Offline) dan status antrian sinkronisasi selalu terlihat jelas tanpa mengganggu alur kasir.
- **Konsistensi Token:** Tidak boleh ada warna atau radius yang di-hardcode. Semua mengacu pada CSS variables di `globals.css`.

---

## 2. Color Tokens

Semua warna mengacu pada CSS variables di `apps/web/src/app/globals.css` (Tailwind CSS v4 + OKLCH).

### Semantic Token Reference

| Token | Light Mode | Dark Mode (`.dark`) | Kegunaan |
| --- | --- | --- | --- |
| `--background` | `oklch(1 0 0)` (Putih) | `oklch(0.145 0 0)` | Background halaman utama |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Teks utama |
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Background card & panel |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Teks di dalam card |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Background dropdown & popover |
| `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Teks popover |
| `--primary` | `oklch(0.841 0.238 128.85)` (Lime / Vibrant Green) | `oklch(0.768 0.233 130.85)` | Tombol utama, checkout CTA, aksi primer |
| `--primary-foreground` | `oklch(0.405 0.101 131.063)` (Dark Forest) | `oklch(0.405 0.101 131.063)` | Teks di atas warna primary |
| `--secondary` | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | Tombol secondary, opsi filter |
| `--secondary-foreground`| `oklch(0.21 0.006 285.885)` | `oklch(0.985 0 0)` | Teks tombol secondary |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Background elemen redup (tag, header tabel) |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | Label, subtitle, SKU, teks helper |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover state menu & item grid |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | Teks saat item aktif/hover |
| `--destructive` | `oklch(0.577 0.245 27.325)` (Merah) | `oklch(0.704 0.191 22.216)` | Void order, refund, delete, alert |
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Border card, separator, input |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Border form field |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focus ring |

### Sidebar Tokens

| Token | Light Mode | Dark Mode | Kegunaan |
| --- | --- | --- | --- |
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | Background sidebar navigasi |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Teks item sidebar |
| `--sidebar-primary` | `oklch(0.648 0.2 131.684)` | `oklch(0.768 0.233 130.85)` | Item navigasi aktif |
| `--sidebar-primary-foreground` | `oklch(0.986 0.031 120.757)`| `oklch(0.274 0.072 132.109)` | Teks item aktif di sidebar |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Hover menu sidebar |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Border pemisah sidebar |

### Status & POS Indicators

| Status / Indikator | Styling Class | Contoh Penggunaan |
| --- | --- | --- |
| **Online (Sync Ready)** | `bg-emerald-500 text-white` / `text-emerald-600` | Status koneksi kasir aktif |
| **Offline (Queue Active)** | `bg-amber-500 text-white` / `text-amber-600` | Kasir offline, transaksi masuk antrian lokal |
| **Syncing** | `animate-spin text-primary` | Sinkronisasi data berlangsung |
| **Mode: Resto (Dine-in)** | `bg-blue-50 text-blue-700 border-blue-200` | Badge order makan di tempat |
| **Mode: Resto (Takeaway)** | `bg-purple-50 text-purple-700 border-purple-200`| Badge order bungkus |
| **Mode: Retail** | `bg-slate-100 text-slate-800` | Badge transaksi retail barcode |
| **Lunas / Completed** | `bg-primary/15 text-foreground font-medium` | Status transaksi sukses |
| **Void / Refund** | `bg-destructive/10 text-destructive` | Transaksi dibatalkan |

---

## 3. Spacing & Radius System

Ukuran radius dasar: `--radius: 0.625rem` (10px).

```css
--radius-sm: calc(var(--radius) * 0.6); /* ~6px  — Badge, input chip, small tag */
--radius-md: calc(var(--radius) * 0.8); /* ~8px  — Input, select, sub-buttons */
--radius-lg: var(--radius);             /* 10px  — Card, POS product card, standard buttons */
--radius-xl: calc(var(--radius) * 1.4); /* ~14px — Dialog, Sheet, Keypad buttons */
--radius-2xl: calc(var(--radius) * 1.8);/* ~18px — Modal container */
```

### Layout Grid & Densities

1. **POS Cashier View (Split Screen):**
   - Kiri: 60-70% (Katalog produk & kategori grid, quick search, barcode input).
   - Kanan: 30-40% (Keranjang transaksi aktif, kalkulasi diskon/pajak, tombol Checkout instan).
2. **Backoffice Dashboard View:**
   - Sidebar navigasi (w-64 desktop, collapsible).
   - Content container dengan padding `p-6` dan `space-y-6`.
   - Card grid statistik: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6`.

---

## 4. Typography

Font: **Roboto / Geist** (`--font-sans`) untuk teks utama, **Geist Mono** (`--font-mono`) untuk kode, barcode, SKU, dan nominal uang.

| Elemen | Class Tailwind | Catatan |
| --- | --- | --- |
| **POS Grand Total** | `text-3xl font-bold font-mono tracking-tight` | Angka total kasir yang harus dibayar |
| **POS Product Card Price** | `text-sm font-semibold font-mono text-primary-foreground` | Harga pada grid produk kasir |
| **Page Title (Backoffice)**| `text-2xl font-semibold tracking-tight` | Header halaman h1 |
| **Section Title** | `text-lg font-semibold` | Judul card / tabel |
| **Table Content** | `text-sm` | Baris data stok, transaksi |
| **SKU / Barcode / ID** | `text-xs font-mono text-muted-foreground` | Identifikasi produk/transaksi |
| **Format Rupiah** | Selalu gunakan format IDR: `Rp 1.250.000` (pemisah titik) | Rata kanan di tabel (`text-right font-mono`) |

---

## 5. UI Component Library (`@repo/ui`)

Semua komponen UI dasar berada di `packages/ui/src/components/ui/` dan diimpor melalui `@repo/ui/components/...`:

| Komponen | Path Import | Kegunaan Utama |
| --- | --- | --- |
| `Button` | `@repo/ui/components/ui/button` | Tombol aksi (default, secondary, outline, destructive, ghost) |
| `Card` | `@repo/ui/components/ui/card` | Container modul, ringkasan dashboard, item keranjang |
| `Input` | `@repo/ui/components/ui/input` | Input text, pencarian produk, scan barcode |
| `Field` | `@repo/ui/components/ui/field` | Form field wrapper (Label + Input + Error text) |
| `Label` | `@repo/ui/components/ui/label` | Label input form |
| `Dialog` | `@repo/ui/components/ui/dialog` | Modal pembayaran, split payment, form produk cepat |
| `Separator` | `@repo/ui/components/ui/separator` | Garis pemisah struk atau section |

---

## 6. Pola & Aturan Khusus POS (Point of Sale)

### A. Alur Kasir (POS Speed & Focus)
- **Keyboard & Scanner First:** Input barcode harus otomatis mendengarkan scanner hardware tanpa mengharuskan kasir klik field input terus-menerus.
- **Quick Cash Buttons:** Pada modal pembayaran tunai, sediakan tombol nominal pas dan pecahan umum (`Uang Pas`, `Rp 50.000`, `Rp 100.000`, `Rp 200.000`).
- **Touch-Friendly Hit Targets:** Tombol produk di kasir minimal tinggi `h-14` (56px) dengan visual gambar/warna kategori yang kontras.

### B. Offline & Sync Status Indicator
Setiap halaman kasir wajib menyertakan status bar:
```tsx
// Status bar offline-first di header kasir
<div className="flex items-center gap-2 text-xs">
  {isOnline ? (
    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Online
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-amber-600 font-medium">
      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Offline ({pendingSyncCount} transaksi tersimpan lokal)
    </span>
  )}
</div>
```

---

## 7. Dos & Don'ts Ringkas

| ✅ DO | ❌ DON'T |
| --- | --- |
| Gunakan `text-primary` & `bg-primary` sesuai tema lime OKLCH | Hardcode warna hex atau nama warna sembarangan (`#00ff00`) |
| Gunakan `font-mono` untuk angka rupiah, invoice ID, & barcode | Format angka uang tanpa separator atau gunakan koma untuk ribuan |
| Sediakan feedback instan (local write ke Dexie) saat kasir klik jual | Menunggu request API selesai sebelum mengupdate UI kasir |
| Gunakan `packages/ui` untuk komponen reusable | Copy-paste kode button/dialog ke dalam setiap page |
| Tampilkan indikator mode toko (`Retail` vs `Resto`) pada outlet switcher | Mengubah skema database hanya untuk membedakan mode resto/retail |

# Panduan Penggunaan Sistem Point of Sales (POS)

Panduan praktis untuk pemilik bisnis (Owner), manajer, dan kasir dalam menggunakan sistem Point of Sales.

---

## 🚪 1. Cara Masuk ke Sistem (Login)

Sistem ini memiliki dua pintu masuk sesuai dengan tugas masing-masing:

### A. Backoffice Admin (Untuk Owner & Manajer)
Digunakan untuk memantau laporan, mengelola outlet, data produk, inventori, dan karyawan.

1. Buka halaman: **`/admin/login`**
2. Masukkan **Email** dan **Password** akun Anda.
3. Klik tombol **Masuk ke Dashboard**.

---

### B. Terminal Kasir POS (Untuk Kasir & Waitstaff)
Digunakan untuk melayani transaksi pembayaran pelanggan dan operasional meja.

1. Buka halaman: **`/pos/login`**
2. Masukkan **6 Digit PIN Kasir** Anda (dapat diketik langsung melalui keyboard atau disentuh melalui tombol angka di layar).
3. Sistem akan otomatis memverifikasi PIN dan membuka layar kasir.

---

## 🧭 2. Alur Penggunaan Dasar

### 🏢 Langkah Awal: Menyiapkan Toko (Owner / Manajer)
1. **Login ke Backoffice Admin** (`/admin/login`).
2. **Tambah Outlet / Cabang**: Masuk ke menu **Outlet** untuk menambahkan cabang toko baru dan mengatur mode bisnis (*Retail* atau *Resto*).
3. **Tambah Kategori & Produk**: Masuk ke menu **Kategori** dan **Produk** untuk mengisi daftar barang, harga jual, dan stok awal.
4. **Buat Akun Kasir**:
   - Buka menu **Karyawan**.
   - Klik **Tambah Karyawan**.
   - Masukkan nama, pilih role **Kasir**, tugaskan ke outlet terkait, dan buatkan **6 digit PIN** unik untuk kasir tersebut.

---

### 💳 Operasional Harian: Kasir Bertugas
1. Kasir membuka **`/pos/login`** di tablet / komputer kasir.
2. Masukkan **6 digit PIN** masing-masing.
3. Layar transaksi kasir siap digunakan untuk melayani pesanan pelanggan.
4. **Selesai Shift / Berganti Kasir**:
   - Klik tombol **Tutup Shift / Keluar** di pojok kanan atas.
   - Kasir berikutnya dapat langsung masuk menggunakan PIN-nya sendiri.

---

## 🔒 3. Keamanan & Tips

- **Jaga Kerahasiaan PIN**: Jangan membagikan 6 digit PIN kasir kepada pihak lain. Setiap transaksi tercatat atas nama pemilik PIN tersebut.
- **Keluar Setelah Bertugas**: Selalu lakukan *Logout / Tutup Shift* saat meninggalkan meja kasir atau selesai menggunakan dashboard admin.
- **Akses Terpisah**: Akun kasir hanya dapat mengakses layar kasir POS dan tidak dapat membuka menu pengaturan harga atau laporan keuangan di backoffice.

# TokoKita Admin Panel

Aplikasi web admin **TokoKita** yang dibangun mengikuti desain Figma "TOKOKITA MOCKUP" dan skema database `tokokita_2.sql`. Dijalankan secara lokal menggunakan **Node.js** (Express + EJS) dan **MySQL/MariaDB** (XAMPP / Laragon / WAMP / dll).

## Fitur

- 🔐 **Login** admin dengan session (Bcrypt-ready, auto-upgrade plaintext → hash)
- 📊 **Dashboard** — KPI cards (total pesanan, sedang dikirim, selesai, pendapatan), grafik 7 hari multi-kurir, pesanan terbaru
- 📦 **Manajemen Produk** — list, filter kategori (chips), filter stok, sort, CRUD lengkap
- 🛒 **Daftar Pesanan** — tab status (Semua / Menunggu Bayar / Diproses / Dikirim / Selesai / Dibatalkan), pencarian, detail pesanan + update status
- 🚚 **Pengiriman** — hero search resi, ringkasan per kurir (JNE, J&T, SiCepat), timeline tracking, ringkasan alamat & pesanan
- 💳 **Pembayaran** — list dengan filter status & metode
- 👥 **Pelanggan** — list pelanggan dengan total pesanan & total belanja

Tampilan mengacu pada palet warna, layout, dan komponen di Figma (sidebar 240px, topbar 72px, primary indigo `#4f46e5`, badge status berwarna, kurir badge JNE/J&T/SiCepat).

## Stack

- Node.js (≥ 16) + Express 4
- EJS + express-ejs-layouts
- MySQL2 (promise pool)
- express-session + connect-flash
- bcryptjs

## Prasyarat

1. **MySQL / MariaDB** sudah berjalan (XAMPP / Laragon / standalone)
2. **Node.js** dan **npm** terinstal

## Cara Menjalankan

### 1. Import database

Buka phpMyAdmin (atau terminal), lalu import file `sql/tokokita.sql`. File SQL otomatis membuat database `tokokita` jika belum ada.

**Via phpMyAdmin:**
- Tab **Import** → pilih `sql/tokokita.sql` → Go

**Via terminal:**
```bash
mysql -u root -p < sql/tokokita.sql
```

### 2. Konfigurasi environment

```bash
cp .env.example .env
```

Edit `.env` sesuai konfigurasi MySQL lokal Anda:
```env
PORT=3000
SESSION_SECRET=ganti-dengan-string-acak

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tokokita
```

### 3. Install dependencies & jalankan

```bash
npm install
npm start
```

Buka browser ke **http://localhost:3000**

### 4. Login

| Email                | Password   | Role        |
|----------------------|------------|-------------|
| `admin@tokokita.com` | `admin123` | Super Admin |
| `kasir@tokokita.com` | `kasir123` | Kasir       |

Password tersimpan sebagai plaintext pada seed pertama; akan otomatis di-upgrade ke bcrypt hash setelah login sukses.

## Struktur Project

```
.
├── app.js                  Entry point Express
├── db.js                   MySQL connection pool
├── helpers.js              Format helper (rupiah, tanggal, status maps)
├── package.json
├── .env.example
├── sql/
│   └── tokokita.sql        Database schema + seed data
├── public/
│   └── css/styles.css      Stylesheet (design tokens + komponen)
├── routes/
│   ├── auth.js             Login / logout
│   ├── dashboard.js
│   ├── produk.js           CRUD produk
│   ├── pesanan.js          List + detail pesanan, update status
│   ├── pengiriman.js       Tracking + multi-kurir stats
│   ├── pembayaran.js
│   └── pelanggan.js
└── views/
    ├── layouts/main.ejs
    ├── partials/{sidebar,topbar}.ejs
    ├── login.ejs
    ├── dashboard.ejs
    ├── produk/{index,form}.ejs
    ├── pesanan/{index,detail}.ejs
    ├── pengiriman/index.ejs
    ├── pembayaran/index.ejs
    ├── pelanggan/index.ejs
    └── 404.ejs / 500.ejs
```

## Catatan

- Aplikasi dijalankan via SSR (server-side rendering) sehingga tidak butuh build step.
- Jika port 3000 sudah digunakan, ubah `PORT` di `.env`.
- Untuk hot-reload saat development: `npm run dev` (memakai nodemon).
- Generated columns (`subtotal` di `detail_pesanan` dan `total_tagihan` di `pesanan`) sudah dihandle oleh MariaDB ≥ 10.2.

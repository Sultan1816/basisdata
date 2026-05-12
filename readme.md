# TokoKita Admin Panel - REST API

Aplikasi admin TokoKita dengan arsitektur **REST API**:

- **Backend**: Express server yang expose endpoint JSON di `/api/*`
- **Frontend**: Halaman EJS dirender sebagai shell HTML kosong; data diambil via `fetch()` ke API dari sisi browser

Database: MySQL/MariaDB (XAMPP, Laragon, dll). Skema sesuai `sql/tokokita.sql`.

## Fitur

- Login admin dengan session cookie
- Dashboard: KPI + pesanan terbaru
- Manajemen Produk: CRUD lengkap
- Daftar Pesanan: filter status, detail, update status
- Pengiriman: tracking by resi + ringkasan per kurir
- Pembayaran & Pelanggan: list dengan filter

## Stack

- Node.js (>= 16)
- Express 4
- MySQL2 (promise pool)
- EJS (shell rendering)
- express-session + bcryptjs
- Vanilla JS di sisi browser (tanpa framework)

## Cara Menjalankan

1. Import database:
   ```bash
   mysql -u root -p < sql/tokokita.sql
   ```
   atau import lewat phpMyAdmin.

2. Setup environment:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` sesuai konfigurasi MySQL Anda.

3. Install dan jalankan:
   ```bash
   npm install
   npm start
   ```

4. Buka http://localhost:3000

Login default:

| Email | Password | Role |
|-------|----------|------|
| `admin@tokokita.com` | `admin123` | Super Admin |
| `kasir@tokokita.com` | `kasir123` | Kasir |

## REST API Endpoints

Semua endpoint membutuhkan session aktif (kecuali `POST /api/auth/login`). Tidak otentikasi -> `401 { error }`.

### Auth

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST   | `/api/auth/login`  | Login. Body: `{ email, password }`. Set session cookie. |
| POST   | `/api/auth/logout` | Logout, hapus session. |
| GET    | `/api/auth/me`     | Info user saat ini. |

### Dashboard

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/dashboard/stats`         | KPI: total pesanan, sedang dikirim, selesai, pendapatan. |
| GET | `/api/dashboard/recent-orders` | 5 pesanan terbaru. Query: `?limit=N`. |

### Produk

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET    | `/api/produk`     | List + counts. Query: `?q=&kategori=&stok=&sort=`. |
| GET    | `/api/produk/:id` | Detail produk. |
| POST   | `/api/produk`     | Buat produk. Body: `{ id_kategori, nama_produk, deskripsi, harga, stok, berat_gram, is_active }`. |
| PUT    | `/api/produk/:id` | Update produk. |
| DELETE | `/api/produk/:id` | Hapus produk (409 jika masih dipakai pesanan). |

### Kategori

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/kategori` | List kategori + total produk per kategori. |

### Pesanan

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET   | `/api/pesanan`             | List. Query: `?status=&q=`. |
| GET   | `/api/pesanan/counts`      | Jumlah pesanan per status. |
| GET   | `/api/pesanan/:id`         | Detail pesanan + items + bayar + kirim. |
| PATCH | `/api/pesanan/:id/status`  | Update status. Body: `{ status }`. |

### Pengiriman

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/pengiriman/kurir-stats` | Ringkasan total/terkirim/perjalanan per kurir. |
| GET | `/api/pengiriman/track`       | Tracking. Query: `?q=<resi>` atau `?kurir=<kode>` untuk yang aktif. |

### Pembayaran

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/pembayaran` | List. Query: `?status=&metode=`. |

### Pelanggan

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/pelanggan` | List + total pesanan + total belanja. Query: `?q=&status=`. |

### Kurir

| Method | Path | Deskripsi |
|--------|------|-----------|
| GET | `/api/kurir` | List master kurir. |

### Response Format

- Sukses: JSON langsung (object atau array sesuai resource).
- Mutasi sukses: `{ ok: true }` atau `{ id_*: ... }` untuk create.
- Error: `{ error: "pesan" }` dengan HTTP status 4xx/5xx.

### Contoh Request via curl

```bash
# Login (simpan cookie)
curl -c cookie.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tokokita.com","password":"admin123"}'

# List produk dengan filter
curl -b cookie.txt "http://localhost:3000/api/produk?kategori=1&stok=tersedia"

# Tambah produk
curl -b cookie.txt -X POST http://localhost:3000/api/produk \
  -H "Content-Type: application/json" \
  -d '{"id_kategori":1,"nama_produk":"Laptop","harga":8500000,"stok":10,"berat_gram":2000,"is_active":1}'

# Update status pesanan
curl -b cookie.txt -X PATCH http://localhost:3000/api/pesanan/1/status \
  -H "Content-Type: application/json" \
  -d '{"status":"dikirim"}'

# Hapus produk
curl -b cookie.txt -X DELETE http://localhost:3000/api/produk/5
```

## Struktur Project

```
.
├── app.js                  Entry point: mounts /api/* and pages
├── db.js                   MySQL2 connection pool
├── helpers.js              Server-side formatters & status maps
├── sql/tokokita.sql        Database schema + seed
├── public/
│   ├── css/styles.css      Minimal stylesheet
│   └── js/api.js           Client fetch wrapper + formatters
├── routes/
│   ├── pages.js            HTML shell routes (GET /, /produk, /pesanan, ...)
│   └── api/
│       ├── auth.js
│       ├── dashboard.js
│       ├── produk.js
│       ├── kategori.js
│       ├── pesanan.js
│       ├── pengiriman.js
│       ├── pembayaran.js
│       ├── pelanggan.js
│       └── kurir.js
└── views/
    ├── layouts/main.ejs     Layout: loads /js/api.js, bootstraps STATUS_*
    ├── partials/{sidebar,topbar}.ejs
    ├── login.ejs            Form submit -> POST /api/auth/login
    ├── dashboard.ejs        Fetches /api/dashboard/*
    ├── produk/{index,form}.ejs
    ├── pesanan/{index,detail}.ejs
    ├── pengiriman/index.ejs
    ├── pembayaran/index.ejs
    ├── pelanggan/index.ejs
    └── 404.ejs / 500.ejs
```

## Arsitektur

1. Browser GET `/produk` -> server render `views/produk/index.ejs` (shell HTML kosong + script tag).
2. Script tag di halaman tersebut memanggil `API.get('/api/produk')` ke server.
3. Server `routes/api/produk.js` query DB, return JSON.
4. Script populate DOM dari hasil JSON.

Session-based auth tetap dipakai (cookie). API endpoint butuh session aktif. Untuk client eksternal (Postman/curl), login dulu via `POST /api/auth/login` untuk dapat cookie session.

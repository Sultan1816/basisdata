-- TokoKita database schema (adapted from tokokita_2.sql)
-- Run this file in phpMyAdmin or via: mysql -u root -p < sql/tokokita.sql

CREATE DATABASE IF NOT EXISTS `tokokita` DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
USE `tokokita`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ------------------------------------------------------------
-- admin
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin` (
  `id_admin` int(11) NOT NULL AUTO_INCREMENT,
  `nama_admin` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Super Admin','Admin','Kasir') NOT NULL DEFAULT 'Admin',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_admin`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin login:
--   Email   : admin@tokokita.com
--   Password: admin123
-- (auth route accepts both plain-text and bcrypt-hashed passwords; the password is
--  auto-upgraded to bcrypt on the first successful login)
INSERT INTO `admin` (`id_admin`, `nama_admin`, `email`, `password`, `role`, `is_active`) VALUES
(1, 'Admin TokoKita', 'admin@tokokita.com', 'admin123', 'Super Admin', 1),
(2, 'Kasir Toko', 'kasir@tokokita.com', 'kasir123', 'Kasir', 1)
ON DUPLICATE KEY UPDATE `nama_admin`=VALUES(`nama_admin`);

-- ------------------------------------------------------------
-- pelanggan
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pelanggan` (
  `id_pelanggan` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `no_hp` varchar(20) NOT NULL,
  `tanggal_daftar` datetime DEFAULT current_timestamp(),
  `status_akun` enum('aktif','nonaktif','diblokir') DEFAULT 'aktif',
  PRIMARY KEY (`id_pelanggan`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pelanggan` (`id_pelanggan`, `nama`, `email`, `password`, `no_hp`, `tanggal_daftar`, `status_akun`) VALUES
(1, 'Budi Santoso', 'budi@mail.com', 'hash123', '081234567890', '2026-04-07 08:48:03', 'aktif'),
(2, 'Sari Dewi', 'sari@mail.com', 'hash456', '081298765432', '2026-04-07 08:48:03', 'aktif'),
(3, 'Andi Wijaya', 'andi@mail.com', 'hash789', '085712345678', '2026-04-07 08:48:03', 'aktif');

-- ------------------------------------------------------------
-- alamat
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `alamat` (
  `id_alamat` int(11) NOT NULL AUTO_INCREMENT,
  `id_pelanggan` int(11) NOT NULL,
  `label` enum('Rumah','Kantor','Kost','Lainnya') DEFAULT 'Rumah',
  `penerima` varchar(100) NOT NULL,
  `no_hp_penerima` varchar(20) NOT NULL,
  `alamat_lengkap` text NOT NULL,
  `kota` varchar(50) NOT NULL,
  `provinsi` varchar(50) NOT NULL,
  `kode_pos` varchar(10) NOT NULL,
  `is_utama` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id_alamat`),
  KEY `id_pelanggan` (`id_pelanggan`),
  CONSTRAINT `alamat_ibfk_1` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id_pelanggan`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `alamat` (`id_alamat`, `id_pelanggan`, `label`, `penerima`, `no_hp_penerima`, `alamat_lengkap`, `kota`, `provinsi`, `kode_pos`, `is_utama`) VALUES
(1, 1, 'Rumah', 'Budi Santoso', '081234567890', 'Jl. Merdeka No.12', 'Surabaya', 'Jawa Timur', '60111', 1),
(2, 1, 'Kantor', 'Budi Santoso', '081234567890', 'Jl. Pemuda No.45 Lt.3', 'Surabaya', 'Jawa Timur', '60271', 0),
(3, 2, 'Rumah', 'Sari Dewi', '081298765432', 'Jl. Mawar No.7', 'Malang', 'Jawa Timur', '65111', 1),
(4, 3, 'Kost', 'Andi Wijaya', '085712345678', 'Jl. Sudirman No.88', 'Jakarta', 'DKI Jakarta', '10220', 1);

-- ------------------------------------------------------------
-- kategori
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kategori` (
  `id_kategori` int(11) NOT NULL AUTO_INCREMENT,
  `id_parent_kategori` int(11) DEFAULT NULL,
  `nama_kategori` varchar(50) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  PRIMARY KEY (`id_kategori`),
  UNIQUE KEY `nama_kategori` (`nama_kategori`),
  KEY `id_parent_kategori` (`id_parent_kategori`),
  CONSTRAINT `kategori_ibfk_1` FOREIGN KEY (`id_parent_kategori`) REFERENCES `kategori` (`id_kategori`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `kategori` (`id_kategori`, `id_parent_kategori`, `nama_kategori`, `deskripsi`) VALUES
(1, NULL, 'Elektronik', 'Gadget dan perangkat elektronik'),
(2, NULL, 'Fashion', 'Pakaian dan aksesoris'),
(3, NULL, 'Rumah Tangga', 'Peralatan rumah tangga');

-- ------------------------------------------------------------
-- master_kurir
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `master_kurir` (
  `id_kurir` int(11) NOT NULL AUTO_INCREMENT,
  `nama_kurir` varchar(50) NOT NULL,
  `kode_kurir` varchar(20) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_kurir`),
  UNIQUE KEY `nama_kurir` (`nama_kurir`),
  UNIQUE KEY `kode_kurir` (`kode_kurir`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `master_kurir` (`id_kurir`, `nama_kurir`, `kode_kurir`, `is_active`) VALUES
(1, 'Jalur Nugraha Ekakurir', 'JNE', 1),
(2, 'J&T Express', 'J&T', 1),
(3, 'SiCepat Ekspres', 'SiCepat', 1);

-- ------------------------------------------------------------
-- produk
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `produk` (
  `id_produk` int(11) NOT NULL AUTO_INCREMENT,
  `id_kategori` int(11) NOT NULL,
  `nama_produk` varchar(150) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `harga` decimal(12,2) NOT NULL CHECK (`harga` >= 0),
  `stok` int(11) NOT NULL DEFAULT 0 CHECK (`stok` >= 0),
  `berat_gram` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_produk`),
  KEY `id_kategori` (`id_kategori`),
  CONSTRAINT `produk_ibfk_1` FOREIGN KEY (`id_kategori`) REFERENCES `kategori` (`id_kategori`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `produk` (`id_produk`, `id_kategori`, `nama_produk`, `deskripsi`, `harga`, `stok`, `berat_gram`, `is_active`) VALUES
(1, 1, 'Smartphone X200', 'Smartphone flagship dengan kamera 108MP', 3500000.00, 50, 250, 1),
(2, 1, 'Headset Bluetooth', 'Headset wireless dengan noise cancelling', 450000.00, 100, 150, 1),
(3, 2, 'Kemeja Pria Slim Fit', 'Kemeja katun premium untuk pria', 185000.00, 75, 300, 1),
(4, 3, 'Rice Cooker 1.8L', 'Rice cooker hemat listrik 1.8 Liter', 380000.00, 30, 2500, 1);

-- ------------------------------------------------------------
-- pesanan
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pesanan` (
  `id_pesanan` int(11) NOT NULL AUTO_INCREMENT,
  `id_pelanggan` int(11) NOT NULL,
  `id_alamat` int(11) NOT NULL,
  `tanggal_pesan` datetime DEFAULT current_timestamp(),
  `total_harga` decimal(12,2) NOT NULL,
  `ongkos_kirim` decimal(12,2) NOT NULL DEFAULT 0.00,
  `diskon` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_tagihan` decimal(12,2) GENERATED ALWAYS AS (`total_harga` + `ongkos_kirim` - `diskon`) STORED,
  `status_pesanan` enum('menunggu_bayar','diproses','dikirim','selesai','dibatalkan') DEFAULT 'menunggu_bayar',
  PRIMARY KEY (`id_pesanan`),
  KEY `id_alamat` (`id_alamat`),
  KEY `idx_pesanan_pelanggan` (`id_pelanggan`),
  CONSTRAINT `pesanan_ibfk_1` FOREIGN KEY (`id_pelanggan`) REFERENCES `pelanggan` (`id_pelanggan`),
  CONSTRAINT `pesanan_ibfk_2` FOREIGN KEY (`id_alamat`) REFERENCES `alamat` (`id_alamat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pesanan` (`id_pesanan`, `id_pelanggan`, `id_alamat`, `tanggal_pesan`, `total_harga`, `ongkos_kirim`, `diskon`, `status_pesanan`) VALUES
(1, 1, 1, '2026-04-07 08:48:04', 3950000.00, 25000.00, 0.00, 'dikirim'),
(2, 2, 3, '2026-04-07 08:48:04', 185000.00, 18000.00, 0.00, 'dikirim'),
(3, 3, 4, '2026-04-07 08:48:04', 380000.00, 15000.00, 0.00, 'diproses');

-- ------------------------------------------------------------
-- detail_pesanan
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `detail_pesanan` (
  `id_detail` int(11) NOT NULL AUTO_INCREMENT,
  `id_pesanan` int(11) NOT NULL,
  `id_produk` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL CHECK (`jumlah` > 0),
  `harga_satuan` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) GENERATED ALWAYS AS (`jumlah` * `harga_satuan`) STORED,
  PRIMARY KEY (`id_detail`),
  KEY `id_pesanan` (`id_pesanan`),
  KEY `id_produk` (`id_produk`),
  CONSTRAINT `detail_pesanan_ibfk_1` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan` (`id_pesanan`) ON DELETE CASCADE,
  CONSTRAINT `detail_pesanan_ibfk_2` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `detail_pesanan` (`id_detail`, `id_pesanan`, `id_produk`, `jumlah`, `harga_satuan`) VALUES
(1, 1, 1, 1, 3500000.00),
(2, 1, 2, 1, 450000.00),
(3, 2, 3, 1, 185000.00),
(4, 3, 4, 1, 380000.00);

-- ------------------------------------------------------------
-- pembayaran
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pembayaran` (
  `id_pembayaran` int(11) NOT NULL AUTO_INCREMENT,
  `id_pesanan` int(11) NOT NULL,
  `metode` enum('transfer_bank','e_wallet','cod') NOT NULL,
  `nama_penyedia` varchar(50) DEFAULT NULL,
  `jumlah_bayar` decimal(12,2) NOT NULL,
  `tanggal_bayar` datetime DEFAULT NULL,
  `status_bayar` enum('pending','berhasil','gagal','refund') DEFAULT 'pending',
  PRIMARY KEY (`id_pembayaran`),
  UNIQUE KEY `id_pesanan` (`id_pesanan`),
  CONSTRAINT `pembayaran_ibfk_1` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan` (`id_pesanan`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pembayaran` (`id_pembayaran`, `id_pesanan`, `metode`, `nama_penyedia`, `jumlah_bayar`, `tanggal_bayar`, `status_bayar`) VALUES
(1, 1, 'transfer_bank', 'BCA', 3950000.00, '2026-04-07 08:48:04', 'berhasil'),
(2, 2, 'e_wallet', 'OVO', 185000.00, '2026-04-07 08:48:04', 'berhasil'),
(3, 3, 'cod', 'COD', 380000.00, NULL, 'pending');

-- ------------------------------------------------------------
-- pengiriman
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pengiriman` (
  `id_pengiriman` int(11) NOT NULL AUTO_INCREMENT,
  `id_pesanan` int(11) NOT NULL,
  `id_kurir` int(11) NOT NULL,
  `layanan` varchar(30) DEFAULT NULL,
  `no_resi` varchar(50) NOT NULL,
  `ongkos_kirim` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_berat_gram` int(11) NOT NULL DEFAULT 0,
  `tanggal_kirim` datetime NOT NULL,
  `estimasi_tiba` date NOT NULL,
  `tanggal_tiba` datetime DEFAULT NULL,
  `status_kirim` enum('diproses','dalam_perjalanan','tiba_di_kota','out_for_delivery','terkirim','gagal_kirim','retur') DEFAULT 'diproses',
  `catatan` text DEFAULT NULL,
  PRIMARY KEY (`id_pengiriman`),
  UNIQUE KEY `id_pesanan` (`id_pesanan`),
  UNIQUE KEY `no_resi` (`no_resi`),
  KEY `idx_resi` (`no_resi`),
  KEY `idx_kurir_status` (`id_kurir`,`status_kirim`),
  CONSTRAINT `pengiriman_ibfk_1` FOREIGN KEY (`id_pesanan`) REFERENCES `pesanan` (`id_pesanan`) ON DELETE CASCADE,
  CONSTRAINT `pengiriman_ibfk_2` FOREIGN KEY (`id_kurir`) REFERENCES `master_kurir` (`id_kurir`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pengiriman` (`id_pengiriman`, `id_pesanan`, `id_kurir`, `layanan`, `no_resi`, `ongkos_kirim`, `total_berat_gram`, `tanggal_kirim`, `estimasi_tiba`, `tanggal_tiba`, `status_kirim`, `catatan`) VALUES
(1, 1, 1, 'REG', 'JNE00123456789', 25000.00, 400, '2026-04-05 10:00:00', '2026-04-08', NULL, 'dalam_perjalanan', NULL),
(2, 2, 2, 'Express', 'JT98765432100', 18000.00, 300, '2026-04-06 09:30:00', '2026-04-08', NULL, 'out_for_delivery', NULL),
(3, 3, 3, 'REG', 'SCP55667788', 15000.00, 2500, '2026-04-07 08:00:00', '2026-04-10', NULL, 'diproses', NULL);

-- ------------------------------------------------------------
-- riwayat_pengiriman
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `riwayat_pengiriman` (
  `id_riwayat` int(11) NOT NULL AUTO_INCREMENT,
  `id_pengiriman` int(11) NOT NULL,
  `waktu_update` datetime DEFAULT current_timestamp(),
  `lokasi` varchar(100) DEFAULT NULL,
  `deskripsi` text NOT NULL,
  `status_kode` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_riwayat`),
  KEY `id_pengiriman` (`id_pengiriman`),
  CONSTRAINT `riwayat_pengiriman_ibfk_1` FOREIGN KEY (`id_pengiriman`) REFERENCES `pengiriman` (`id_pengiriman`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `riwayat_pengiriman` (`id_riwayat`, `id_pengiriman`, `waktu_update`, `lokasi`, `deskripsi`, `status_kode`) VALUES
(1, 1, '2026-04-05 08:30:00', 'TokoKita Warehouse Surabaya', 'Paket siap dikirim dari TokoKita Warehouse Surabaya', 'diproses'),
(2, 1, '2026-04-05 10:00:00', 'Surabaya', 'Paket dipickup oleh kurir JNE', 'dalam_perjalanan'),
(3, 1, '2026-04-05 14:20:00', 'Surabaya', 'Paket dalam perjalanan ke Sortir Center Surabaya', 'dalam_perjalanan'),
(4, 1, '2026-04-06 22:15:00', 'Sortir Center Surabaya', 'Paket tiba di Sortir Center Surabaya', 'tiba_di_kota'),
(5, 1, '2026-04-07 09:45:00', 'Surabaya', 'Paket sedang menuju agen kota tujuan', 'dalam_perjalanan'),
(6, 2, '2026-04-06 09:30:00', 'Malang', 'Paket dipickup oleh kurir J&T', 'dalam_perjalanan'),
(7, 2, '2026-04-07 11:00:00', 'Malang', 'Kurir sedang menuju alamat penerima', 'out_for_delivery'),
(8, 3, '2026-04-07 08:00:00', 'Gudang Pusat', 'Pesanan menggunakan resi SCP55667788 telah direkam di sistem.', 'diproses');

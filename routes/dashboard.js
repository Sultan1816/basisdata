const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM pesanan) AS total_pesanan,
        (SELECT COUNT(*) FROM pesanan WHERE status_pesanan = 'dikirim') AS sedang_dikirim,
        (SELECT COUNT(*) FROM pesanan WHERE status_pesanan = 'selesai') AS pesanan_selesai,
        (SELECT COALESCE(SUM(total_tagihan), 0) FROM pesanan WHERE status_pesanan IN ('selesai','dikirim')) AS pendapatan
    `);

    const [recentOrders] = await db.query(`
      SELECT
        p.id_pesanan,
        p.status_pesanan,
        p.total_tagihan,
        p.tanggal_pesan,
        pl.nama AS pelanggan,
        (
          SELECT pr.nama_produk
          FROM detail_pesanan dp
          JOIN produk pr ON pr.id_produk = dp.id_produk
          WHERE dp.id_pesanan = p.id_pesanan
          ORDER BY dp.id_detail ASC
          LIMIT 1
        ) AS produk_utama
      FROM pesanan p
      JOIN pelanggan pl ON pl.id_pelanggan = p.id_pelanggan
      ORDER BY p.tanggal_pesan DESC, p.id_pesanan DESC
      LIMIT 5
    `);

    const [kurirCounts] = await db.query(`
      SELECT k.kode_kurir, COUNT(pg.id_pengiriman) AS total
      FROM master_kurir k
      LEFT JOIN pengiriman pg ON pg.id_kurir = k.id_kurir
      GROUP BY k.id_kurir, k.kode_kurir
    `);

    const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    const chart = days.map((d, i) => ({
      day: d,
      jne: [120, 140, 100, 160, 180, 200, 150][i],
      jnt: [90, 110, 130, 120, 140, 160, 130][i],
      sicepat: [60, 80, 70, 90, 100, 120, 90][i]
    }));

    res.render('dashboard', {
      title: 'Dashboard - TokoKita',
      pageTitle: 'Dashboard',
      breadcrumb: 'Home / Dashboard',
      stats,
      recentOrders,
      kurirCounts,
      chart
    });
  } catch (err) { next(err); }
});

module.exports = router;

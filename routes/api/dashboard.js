const express = require('express');
const db = require('../../db');

const router = express.Router();

router.get('/stats', async (req, res, next) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM pesanan) AS total_pesanan,
        (SELECT COUNT(*) FROM pesanan WHERE status_pesanan = 'dikirim') AS sedang_dikirim,
        (SELECT COUNT(*) FROM pesanan WHERE status_pesanan = 'selesai') AS pesanan_selesai,
        (SELECT COALESCE(SUM(total_tagihan), 0) FROM pesanan
           WHERE status_pesanan IN ('selesai','dikirim')) AS pendapatan
    `);
    res.json(stats);
  } catch (err) { next(err); }
});

router.get('/recent-orders', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 50);
    const [rows] = await db.query(`
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
      LIMIT ?
    `, [limit]);
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;

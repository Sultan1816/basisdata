const express = require('express');
const db = require('../../db');

const router = express.Router();

router.get('/kurir-stats', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT k.kode_kurir, k.nama_kurir,
        COUNT(pg.id_pengiriman) AS total,
        SUM(CASE WHEN pg.status_kirim = 'terkirim' THEN 1 ELSE 0 END) AS terkirim,
        SUM(CASE WHEN pg.status_kirim IN ('dalam_perjalanan','tiba_di_kota','out_for_delivery')
                 THEN 1 ELSE 0 END) AS perjalanan
      FROM master_kurir k
      LEFT JOIN pengiriman pg ON pg.id_kurir = k.id_kurir
      GROUP BY k.id_kurir, k.kode_kurir, k.nama_kurir
      ORDER BY k.id_kurir
    `);
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/track', async (req, res, next) => {
  try {
    const { q, kurir } = req.query;
    let tracking = null;

    if (q) {
      const [[row]] = await db.query(`
        SELECT pg.*, kr.kode_kurir, kr.nama_kurir
        FROM pengiriman pg
        JOIN master_kurir kr ON kr.id_kurir = pg.id_kurir
        WHERE pg.no_resi = ?
        LIMIT 1
      `, [q]);
      tracking = row || null;
    } else {
      const filter = kurir ? ' AND kr.kode_kurir = ?' : '';
      const args = kurir ? [kurir] : [];
      const [[row]] = await db.query(`
        SELECT pg.*, kr.kode_kurir, kr.nama_kurir
        FROM pengiriman pg
        JOIN master_kurir kr ON kr.id_kurir = pg.id_kurir
        WHERE pg.status_kirim IN ('dalam_perjalanan','out_for_delivery','tiba_di_kota','diproses')
        ${filter}
        ORDER BY pg.tanggal_kirim DESC
        LIMIT 1
      `, args);
      tracking = row || null;
    }

    if (!tracking) return res.json({ tracking: null });

    const [riwayat] = await db.query(`
      SELECT * FROM riwayat_pengiriman WHERE id_pengiriman = ?
      ORDER BY waktu_update ASC
    `, [tracking.id_pengiriman]);

    const [[pesanan]] = await db.query(`
      SELECT p.*, pl.nama AS pelanggan_nama,
             a.penerima, a.no_hp_penerima, a.alamat_lengkap, a.kota, a.provinsi, a.kode_pos
      FROM pesanan p
      JOIN pelanggan pl ON pl.id_pelanggan = p.id_pelanggan
      JOIN alamat a ON a.id_alamat = p.id_alamat
      WHERE p.id_pesanan = ?
    `, [tracking.id_pesanan]);

    const [items] = await db.query(`
      SELECT dp.*, pr.nama_produk
      FROM detail_pesanan dp
      JOIN produk pr ON pr.id_produk = dp.id_produk
      WHERE dp.id_pesanan = ?
    `, [tracking.id_pesanan]);

    const [[bayar]] = await db.query('SELECT * FROM pembayaran WHERE id_pesanan = ?', [tracking.id_pesanan]);

    res.json({ tracking, riwayat, pesanan, items, bayar: bayar || null });
  } catch (err) { next(err); }
});

module.exports = router;

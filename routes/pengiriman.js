const express = require('express');
const db = require('../db');

const router = express.Router();

async function getKurirStats() {
  const [rows] = await db.query(`
    SELECT k.kode_kurir, k.nama_kurir,
      COUNT(pg.id_pengiriman) AS total,
      SUM(CASE WHEN pg.status_kirim = 'terkirim' THEN 1 ELSE 0 END) AS terkirim,
      SUM(CASE WHEN pg.status_kirim IN ('dalam_perjalanan','tiba_di_kota','out_for_delivery') THEN 1 ELSE 0 END) AS perjalanan
    FROM master_kurir k
    LEFT JOIN pengiriman pg ON pg.id_kurir = k.id_kurir
    GROUP BY k.id_kurir, k.kode_kurir, k.nama_kurir
    ORDER BY k.id_kurir
  `);
  return rows;
}

router.get('/', async (req, res, next) => {
  try {
    const { q, kurir } = req.query;
    const kurirStats = await getKurirStats();

    // Pick pengiriman: by resi or first active one
    let tracking = null, riwayat = [], pesanan = null, alamat = null, items = [], bayar = null;

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
      // default: first ongoing pengiriman
      const [[row]] = await db.query(`
        SELECT pg.*, kr.kode_kurir, kr.nama_kurir
        FROM pengiriman pg
        JOIN master_kurir kr ON kr.id_kurir = pg.id_kurir
        WHERE pg.status_kirim IN ('dalam_perjalanan','out_for_delivery','tiba_di_kota','diproses')
        ${kurir ? ' AND kr.kode_kurir = ?' : ''}
        ORDER BY pg.tanggal_kirim DESC
        LIMIT 1
      `, kurir ? [kurir] : []);
      tracking = row || null;
    }

    if (tracking) {
      const [r1] = await db.query(`
        SELECT * FROM riwayat_pengiriman
        WHERE id_pengiriman = ?
        ORDER BY waktu_update ASC
      `, [tracking.id_pengiriman]);
      riwayat = r1;

      const [[p]] = await db.query(`
        SELECT p.*, pl.nama AS pelanggan_nama,
               a.penerima, a.no_hp_penerima, a.alamat_lengkap, a.kota, a.provinsi, a.kode_pos
        FROM pesanan p
        JOIN pelanggan pl ON pl.id_pelanggan = p.id_pelanggan
        JOIN alamat a ON a.id_alamat = p.id_alamat
        WHERE p.id_pesanan = ?
      `, [tracking.id_pesanan]);
      pesanan = p;

      const [its] = await db.query(`
        SELECT dp.*, pr.nama_produk
        FROM detail_pesanan dp
        JOIN produk pr ON pr.id_produk = dp.id_produk
        WHERE dp.id_pesanan = ?
      `, [tracking.id_pesanan]);
      items = its;

      const [[b]] = await db.query(`SELECT * FROM pembayaran WHERE id_pesanan = ?`, [tracking.id_pesanan]);
      bayar = b || null;
    }

    res.render('pengiriman/index', {
      title: 'Pengiriman - TokoKita',
      pageTitle: 'Pengiriman - Tracking Paket',
      breadcrumb: 'Home / Pengiriman',
      kurirStats,
      tracking,
      riwayat,
      pesanan,
      items,
      bayar,
      filters: { q: q || '', kurir: kurir || '' }
    });
  } catch (err) { next(err); }
});

module.exports = router;

const express = require('express');
const db = require('../../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, q } = req.query;
    let where = '1=1';
    const params = [];
    if (status && status !== 'semua') {
      where += ' AND p.status_pesanan = ?';
      params.push(status);
    }
    if (q) {
      where += ' AND (pl.nama LIKE ? OR pl.email LIKE ? OR p.id_pesanan = ?)';
      params.push(`%${q}%`, `%${q}%`, isNaN(parseInt(q)) ? 0 : parseInt(q));
    }

    const [rows] = await db.query(`
      SELECT
        p.id_pesanan, p.tanggal_pesan, p.total_tagihan, p.status_pesanan,
        pl.nama AS pelanggan_nama, pl.email AS pelanggan_email,
        pay.metode AS bayar_metode, pay.nama_penyedia AS bayar_penyedia,
        pay.status_bayar, kr.kode_kurir
      FROM pesanan p
      JOIN pelanggan pl ON pl.id_pelanggan = p.id_pelanggan
      LEFT JOIN pembayaran pay ON pay.id_pesanan = p.id_pesanan
      LEFT JOIN pengiriman pg  ON pg.id_pesanan = p.id_pesanan
      LEFT JOIN master_kurir kr ON kr.id_kurir = pg.id_kurir
      WHERE ${where}
      ORDER BY p.tanggal_pesan DESC, p.id_pesanan DESC
    `, params);

    res.json({ data: rows });
  } catch (err) { next(err); }
});

router.get('/counts', async (req, res, next) => {
  try {
    const [counts] = await db.query(`
      SELECT status_pesanan, COUNT(*) AS total FROM pesanan GROUP BY status_pesanan
    `);
    const cmap = {};
    counts.forEach(c => cmap[c.status_pesanan] = c.total);
    const [[totalAll]] = await db.query('SELECT COUNT(*) AS total FROM pesanan');
    res.json({
      semua: totalAll.total,
      menunggu_bayar: cmap.menunggu_bayar || 0,
      diproses:       cmap.diproses       || 0,
      dikirim:        cmap.dikirim        || 0,
      selesai:        cmap.selesai        || 0,
      dibatalkan:     cmap.dibatalkan     || 0
    });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [[pesanan]] = await db.query(`
      SELECT p.*, pl.nama AS pelanggan_nama, pl.email AS pelanggan_email, pl.no_hp,
             a.label, a.penerima, a.no_hp_penerima, a.alamat_lengkap,
             a.kota, a.provinsi, a.kode_pos
      FROM pesanan p
      JOIN pelanggan pl ON pl.id_pelanggan = p.id_pelanggan
      JOIN alamat a ON a.id_alamat = p.id_alamat
      WHERE p.id_pesanan = ?
    `, [req.params.id]);
    if (!pesanan) return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });

    const [items] = await db.query(`
      SELECT dp.*, pr.nama_produk
      FROM detail_pesanan dp
      JOIN produk pr ON pr.id_produk = dp.id_produk
      WHERE dp.id_pesanan = ?
    `, [req.params.id]);

    const [[bayar]] = await db.query('SELECT * FROM pembayaran WHERE id_pesanan = ?', [req.params.id]);
    const [[kirim]] = await db.query(`
      SELECT pg.*, kr.kode_kurir, kr.nama_kurir
      FROM pengiriman pg
      LEFT JOIN master_kurir kr ON kr.id_kurir = pg.id_kurir
      WHERE pg.id_pesanan = ?
    `, [req.params.id]);

    res.json({ pesanan, items, bayar: bayar || null, kirim: kirim || null });
  } catch (err) { next(err); }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const allowed = ['menunggu_bayar', 'diproses', 'dikirim', 'selesai', 'dibatalkan'];
    const { status } = req.body || {};
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid.' });
    }
    const [r] = await db.query(
      'UPDATE pesanan SET status_pesanan = ? WHERE id_pesanan = ?',
      [status, req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

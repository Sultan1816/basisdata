const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { q, status } = req.query;
    let where = '1=1';
    const params = [];
    if (q) {
      where += ' AND (pl.nama LIKE ? OR pl.email LIKE ? OR pl.no_hp LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (status) { where += ' AND pl.status_akun = ?'; params.push(status); }

    const [rows] = await db.query(`
      SELECT pl.*,
        (SELECT COUNT(*) FROM pesanan p WHERE p.id_pelanggan = pl.id_pelanggan) AS total_pesanan,
        (SELECT COALESCE(SUM(p.total_tagihan),0) FROM pesanan p WHERE p.id_pelanggan = pl.id_pelanggan AND p.status_pesanan IN ('selesai','dikirim')) AS total_belanja
      FROM pelanggan pl
      WHERE ${where}
      ORDER BY pl.id_pelanggan DESC
    `, params);

    res.render('pelanggan/index', {
      title: 'Daftar Pelanggan - TokoKita',
      pageTitle: 'Daftar Pelanggan',
      breadcrumb: 'Home / Pelanggan',
      pelanggan: rows,
      filters: { q: q || '', status: status || '' }
    });
  } catch (err) { next(err); }
});

module.exports = router;

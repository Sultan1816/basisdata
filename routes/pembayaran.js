const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, metode } = req.query;
    let where = '1=1';
    const params = [];
    if (status) { where += ' AND pay.status_bayar = ?'; params.push(status); }
    if (metode) { where += ' AND pay.metode = ?';      params.push(metode); }

    const [rows] = await db.query(`
      SELECT pay.*, p.id_pesanan, pl.nama AS pelanggan_nama, pl.email AS pelanggan_email
      FROM pembayaran pay
      JOIN pesanan p ON p.id_pesanan = pay.id_pesanan
      JOIN pelanggan pl ON pl.id_pelanggan = p.id_pelanggan
      WHERE ${where}
      ORDER BY pay.id_pembayaran DESC
    `, params);

    res.render('pembayaran/index', {
      title: 'Daftar Pembayaran - TokoKita',
      pageTitle: 'Daftar Pembayaran',
      breadcrumb: 'Home / Pembayaran',
      pembayaran: rows,
      filters: { status: status || '', metode: metode || '' }
    });
  } catch (err) { next(err); }
});

module.exports = router;

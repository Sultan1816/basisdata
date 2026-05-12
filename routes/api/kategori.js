const express = require('express');
const db = require('../../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT k.id_kategori, k.nama_kategori, k.deskripsi,
        COUNT(p.id_produk) AS total
      FROM kategori k
      LEFT JOIN produk p ON p.id_kategori = k.id_kategori
      GROUP BY k.id_kategori, k.nama_kategori, k.deskripsi
      ORDER BY k.id_kategori
    `);
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;

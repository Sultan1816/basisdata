const express = require('express');
const db = require('../../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id_kurir, kode_kurir, nama_kurir, is_active FROM master_kurir ORDER BY id_kurir'
    );
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;

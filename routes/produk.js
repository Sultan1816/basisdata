const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { q, kategori, stok, sort } = req.query;

    let where = '1=1';
    const params = [];
    if (q) {
      where += ' AND (p.nama_produk LIKE ? OR p.deskripsi LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }
    if (kategori) {
      where += ' AND p.id_kategori = ?';
      params.push(kategori);
    }
    if (stok === 'habis')   where += ' AND p.stok = 0';
    if (stok === 'rendah')  where += ' AND p.stok > 0 AND p.stok <= 10';
    if (stok === 'tersedia') where += ' AND p.stok > 10';

    let orderBy = 'p.id_produk DESC';
    if (sort === 'termurah')   orderBy = 'p.harga ASC';
    if (sort === 'termahal')   orderBy = 'p.harga DESC';
    if (sort === 'nama_asc')   orderBy = 'p.nama_produk ASC';
    if (sort === 'stok_rendah') orderBy = 'p.stok ASC';

    const [products] = await db.query(`
      SELECT p.*, k.nama_kategori
      FROM produk p
      JOIN kategori k ON k.id_kategori = p.id_kategori
      WHERE ${where}
      ORDER BY ${orderBy}
    `, params);

    const [[counts]] = await db.query(`
      SELECT
        COUNT(*) AS total_produk,
        SUM(CASE WHEN stok = 0 THEN 1 ELSE 0 END) AS stok_habis,
        SUM(CASE WHEN stok > 0 AND stok <= 10 THEN 1 ELSE 0 END) AS stok_rendah
      FROM produk
    `);
    const [[kategoriAktif]] = await db.query(`SELECT COUNT(*) AS total FROM kategori`);

    const [kategoriList] = await db.query(`
      SELECT k.id_kategori, k.nama_kategori, COUNT(p.id_produk) AS total
      FROM kategori k
      LEFT JOIN produk p ON p.id_kategori = k.id_kategori
      GROUP BY k.id_kategori, k.nama_kategori
      ORDER BY k.id_kategori
    `);
    const [[totalProduk]] = await db.query(`SELECT COUNT(*) AS total FROM produk`);

    res.render('produk/index', {
      title: 'Manajemen Produk - TokoKita',
      pageTitle: 'Manajemen Produk',
      breadcrumb: 'Home / Produk',
      products,
      counts: {
        total_produk: counts.total_produk || 0,
        stok_habis: counts.stok_habis || 0,
        stok_rendah: counts.stok_rendah || 0,
        kategori_aktif: kategoriAktif.total || 0
      },
      kategoriList,
      totalProduk: totalProduk.total,
      filters: { q: q || '', kategori: kategori || '', stok: stok || '', sort: sort || '' }
    });
  } catch (err) { next(err); }
});

router.get('/baru', async (req, res, next) => {
  try {
    const [kategoriList] = await db.query('SELECT id_kategori, nama_kategori FROM kategori ORDER BY nama_kategori');
    res.render('produk/form', {
      title: 'Tambah Produk - TokoKita',
      pageTitle: 'Tambah Produk',
      breadcrumb: 'Home / Produk / Tambah',
      produk: null,
      kategoriList
    });
  } catch (err) { next(err); }
});

router.post('/baru', async (req, res, next) => {
  try {
    const { id_kategori, nama_produk, deskripsi, harga, stok, berat_gram, is_active } = req.body;
    await db.query(`
      INSERT INTO produk (id_kategori, nama_produk, deskripsi, harga, stok, berat_gram, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id_kategori, nama_produk, deskripsi || null, harga, stok, berat_gram || 0, is_active ? 1 : 0]);
    req.flash('success', `Produk "${nama_produk}" berhasil ditambahkan.`);
    res.redirect('/produk');
  } catch (err) { next(err); }
});

router.get('/:id/edit', async (req, res, next) => {
  try {
    const [[produk]] = await db.query('SELECT * FROM produk WHERE id_produk = ?', [req.params.id]);
    if (!produk) {
      req.flash('error', 'Produk tidak ditemukan.');
      return res.redirect('/produk');
    }
    const [kategoriList] = await db.query('SELECT id_kategori, nama_kategori FROM kategori ORDER BY nama_kategori');
    res.render('produk/form', {
      title: 'Edit Produk - TokoKita',
      pageTitle: 'Edit Produk',
      breadcrumb: 'Home / Produk / Edit',
      produk,
      kategoriList
    });
  } catch (err) { next(err); }
});

router.post('/:id/edit', async (req, res, next) => {
  try {
    const { id_kategori, nama_produk, deskripsi, harga, stok, berat_gram, is_active } = req.body;
    await db.query(`
      UPDATE produk SET id_kategori=?, nama_produk=?, deskripsi=?, harga=?, stok=?, berat_gram=?, is_active=?
      WHERE id_produk=?
    `, [id_kategori, nama_produk, deskripsi || null, harga, stok, berat_gram || 0, is_active ? 1 : 0, req.params.id]);
    req.flash('success', `Produk "${nama_produk}" diperbarui.`);
    res.redirect('/produk');
  } catch (err) { next(err); }
});

router.post('/:id/hapus', async (req, res, next) => {
  try {
    await db.query('DELETE FROM produk WHERE id_produk = ?', [req.params.id]);
    req.flash('success', 'Produk dihapus.');
    res.redirect('/produk');
  } catch (err) {
    req.flash('error', 'Tidak bisa menghapus produk yang masih digunakan di pesanan.');
    res.redirect('/produk');
  }
});

module.exports = router;

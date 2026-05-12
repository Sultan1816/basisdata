const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('login', { title: 'Masuk - TokoKita', layout: false });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM admin WHERE email = ? AND is_active = 1 LIMIT 1',
      [email]
    );
    if (rows.length === 0) {
      req.flash('error', 'Email atau password salah.');
      return res.redirect('/login');
    }
    const admin = rows[0];

    let ok = false;
    if (typeof admin.password === 'string' && admin.password.startsWith('$2')) {
      ok = await bcrypt.compare(password, admin.password);
    } else {
      ok = password === admin.password;
      if (ok) {
        // upgrade to bcrypt
        const hashed = await bcrypt.hash(password, 10);
        await db.query('UPDATE admin SET password = ? WHERE id_admin = ?', [hashed, admin.id_admin]);
      }
    }

    if (!ok) {
      req.flash('error', 'Email atau password salah.');
      return res.redirect('/login');
    }

    req.session.user = {
      id: admin.id_admin,
      nama: admin.nama_admin,
      email: admin.email,
      role: admin.role
    };
    req.flash('success', `Selamat datang, ${admin.nama_admin}!`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Terjadi kesalahan server.');
    res.redirect('/login');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;

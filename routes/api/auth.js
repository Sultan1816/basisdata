const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  }
  try {
    const [rows] = await db.query(
      'SELECT * FROM admin WHERE email = ? AND is_active = 1 LIMIT 1',
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah.' });
    }
    const admin = rows[0];

    let ok = false;
    if (typeof admin.password === 'string' && admin.password.startsWith('$2')) {
      ok = await bcrypt.compare(password, admin.password);
    } else {
      ok = password === admin.password;
      if (ok) {
        const hashed = await bcrypt.hash(password, 10);
        await db.query('UPDATE admin SET password = ? WHERE id_admin = ?', [hashed, admin.id_admin]);
      }
    }

    if (!ok) return res.status(401).json({ error: 'Email atau password salah.' });

    req.session.user = {
      id: admin.id_admin,
      nama: admin.nama_admin,
      email: admin.email,
      role: admin.role
    };
    res.json({ user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Belum login.' });
  res.json({ user: req.session.user });
});

module.exports = router;

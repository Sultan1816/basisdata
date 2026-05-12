require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

const helpers = require('./helpers');

const app = express();

/* ===== View engine ===== */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

/* ===== Middleware ===== */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'tokokita-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;
  res.locals.STATUS_PESANAN = helpers.STATUS_PESANAN;
  res.locals.STATUS_KIRIM   = helpers.STATUS_KIRIM;
  res.locals.STATUS_BAYAR   = helpers.STATUS_BAYAR;
  next();
});

/* ===== API auth gate ===== */
function requireApiAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Belum login.' });
  next();
}

/* ===== Mount API ===== */
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/dashboard',  requireApiAuth, require('./routes/api/dashboard'));
app.use('/api/produk',     requireApiAuth, require('./routes/api/produk'));
app.use('/api/kategori',   requireApiAuth, require('./routes/api/kategori'));
app.use('/api/pesanan',    requireApiAuth, require('./routes/api/pesanan'));
app.use('/api/pengiriman', requireApiAuth, require('./routes/api/pengiriman'));
app.use('/api/pembayaran', requireApiAuth, require('./routes/api/pembayaran'));
app.use('/api/pelanggan',  requireApiAuth, require('./routes/api/pelanggan'));
app.use('/api/kurir',      requireApiAuth, require('./routes/api/kurir'));

/* ===== Mount pages ===== */
app.use('/', require('./routes/pages'));

/* ===== Error handlers ===== */
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
  }
  res.status(404).render('404', { title: 'Halaman tidak ditemukan', pageTitle: '404', breadcrumb: '' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ error: 'Server error.' });
  }
  res.status(500).render('500', { title: 'Server Error', pageTitle: 'Error', breadcrumb: '', error: err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TokoKita Admin running at http://localhost:${PORT}`);
});

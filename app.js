require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'tokokita-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }
}));
app.use(flash());

const helpers = require('./helpers');
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = {
    success: req.flash('success'),
    error: req.flash('error')
  };
  res.locals.currentPath = req.path;
  Object.assign(res.locals, helpers);
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

app.use('/', require('./routes/auth'));
app.use('/', requireAuth, require('./routes/dashboard'));
app.use('/produk', requireAuth, require('./routes/produk'));
app.use('/pesanan', requireAuth, require('./routes/pesanan'));
app.use('/pengiriman', requireAuth, require('./routes/pengiriman'));
app.use('/pembayaran', requireAuth, require('./routes/pembayaran'));
app.use('/pelanggan', requireAuth, require('./routes/pelanggan'));

app.use((req, res) => {
  res.status(404).render('404', { title: 'Halaman tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', { title: 'Server Error', error: err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TokoKita Admin running at http://localhost:${PORT}`);
});

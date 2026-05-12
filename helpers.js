function rupiah(n) {
  const v = Number(n || 0);
  return 'Rp ' + v.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

function rupiahShort(n) {
  const v = Number(n || 0);
  if (v >= 1_000_000_000) return 'Rp ' + (v / 1_000_000_000).toFixed(1).replace('.0', '') + 'M';
  if (v >= 1_000_000)     return 'Rp ' + (v / 1_000_000).toFixed(0) + 'jt';
  if (v >= 1_000)         return 'Rp ' + (v / 1_000).toFixed(0) + 'rb';
  return rupiah(v);
}

const monthsId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTanggal(d) {
  if (!d) return '-';
  const dt = (d instanceof Date) ? d : new Date(String(d).replace(' ', 'T'));
  if (isNaN(dt)) return String(d);
  return `${String(dt.getDate()).padStart(2, '0')} ${monthsId[dt.getMonth()]} ${dt.getFullYear()}`;
}

function formatTanggalJam(d) {
  if (!d) return '-';
  const dt = (d instanceof Date) ? d : new Date(String(d).replace(' ', 'T'));
  if (isNaN(dt)) return String(d);
  const tgl = `${String(dt.getDate()).padStart(2, '0')} ${monthsId[dt.getMonth()]} ${dt.getFullYear()}`;
  const jam = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  return `${tgl}, ${jam}`;
}

const STATUS_PESANAN = {
  menunggu_bayar: 'Menunggu Bayar',
  diproses:       'Diproses',
  dikirim:        'Dikirim',
  selesai:        'Selesai',
  dibatalkan:     'Dibatalkan'
};

const STATUS_KIRIM = {
  diproses:         'Diproses',
  dalam_perjalanan: 'Dalam Perjalanan',
  tiba_di_kota:     'Tiba di Kota',
  out_for_delivery: 'Sedang Diantar',
  terkirim:         'Terkirim',
  gagal_kirim:      'Gagal',
  retur:            'Retur'
};

const STATUS_BAYAR = {
  pending:  'Pending',
  berhasil: 'Berhasil',
  gagal:    'Gagal',
  refund:   'Refund'
};

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function metodeLabel(metode, penyedia) {
  if (!metode) return '-';
  if (metode === 'transfer_bank') return penyedia ? `Transfer ${penyedia}` : 'Transfer Bank';
  if (metode === 'e_wallet')      return penyedia || 'E-Wallet';
  if (metode === 'cod')           return 'COD';
  return metode;
}

module.exports = {
  rupiah,
  rupiahShort,
  formatTanggal,
  formatTanggalJam,
  STATUS_PESANAN,
  STATUS_KIRIM,
  STATUS_BAYAR,
  initials,
  metodeLabel
};

function rupiah(n) {
  const v = Number(n || 0);
  return 'Rp ' + v.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

function rupiahShort(n) {
  const v = Number(n || 0);
  if (v >= 1_000_000_000) return 'Rp ' + (v / 1_000_000_000).toFixed(1).replace('.0','') + 'M';
  if (v >= 1_000_000)     return 'Rp ' + (v / 1_000_000).toFixed(0) + 'jt';
  if (v >= 1_000)         return 'Rp ' + (v / 1_000).toFixed(0) + 'rb';
  return rupiah(v);
}

const monthsId = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
function formatTanggal(d) {
  if (!d) return '-';
  const dt = (d instanceof Date) ? d : new Date(String(d).replace(' ', 'T'));
  if (isNaN(dt)) return String(d);
  return `${String(dt.getDate()).padStart(2,'0')} ${monthsId[dt.getMonth()]} ${dt.getFullYear()}`;
}
function formatTanggalJam(d) {
  if (!d) return '-';
  const dt = (d instanceof Date) ? d : new Date(String(d).replace(' ', 'T'));
  if (isNaN(dt)) return String(d);
  return `${String(dt.getDate()).padStart(2,'0')} ${monthsId[dt.getMonth()]} ${dt.getFullYear()}, ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
}

const STATUS_PESANAN = {
  menunggu_bayar: { label: 'Menunggu', class: 'badge-warning' },
  diproses:       { label: 'Diproses', class: 'badge-info' },
  dikirim:        { label: 'Dikirim',  class: 'badge-purple' },
  selesai:        { label: 'Selesai',  class: 'badge-success' },
  dibatalkan:     { label: 'Dibatalkan', class: 'badge-danger' }
};

const STATUS_KIRIM = {
  diproses:         { label: 'Diproses',         class: 'badge-info' },
  dalam_perjalanan: { label: 'Dalam Perjalanan', class: 'badge-info' },
  tiba_di_kota:     { label: 'Tiba di Kota',     class: 'badge-purple' },
  out_for_delivery: { label: 'Diantar',          class: 'badge-warning' },
  terkirim:         { label: 'Terkirim',         class: 'badge-success' },
  gagal_kirim:      { label: 'Gagal',            class: 'badge-danger' },
  retur:            { label: 'Retur',            class: 'badge-danger' }
};

const STATUS_BAYAR = {
  pending:  { label: 'Pending',  class: 'badge-warning' },
  berhasil: { label: 'Berhasil', class: 'badge-success' },
  gagal:    { label: 'Gagal',    class: 'badge-danger' },
  refund:   { label: 'Refund',   class: 'badge-muted' }
};

function kurirClass(kode) {
  if (!kode) return '';
  const k = String(kode).toUpperCase();
  if (k === 'JNE') return 'kurir-JNE';
  if (k === 'J&T' || k === 'JT') return 'kurir-JT';
  if (k.toUpperCase() === 'SICEPAT') return 'kurir-SiCepat';
  return '';
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase();
}

function metodeLabel(metode, penyedia) {
  if (!metode) return '-';
  if (metode === 'transfer_bank') return penyedia ? `Transfer ${penyedia}` : 'Transfer Bank';
  if (metode === 'e_wallet')      return penyedia || 'E-Wallet';
  if (metode === 'cod')           return 'COD';
  return metode;
}

module.exports = {
  rupiah, rupiahShort, formatTanggal, formatTanggalJam,
  STATUS_PESANAN, STATUS_KIRIM, STATUS_BAYAR,
  kurirClass, initials, metodeLabel
};

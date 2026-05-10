const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id_produk: String,
  nama: String,
  harga_jual: Number,
  harga_modal: Number,
  qty: Number,
  diskon_persen: { type: Number, default: 0 },
  diskon_rp: { type: Number, default: 0 },
  subtotal: Number,
  profit: Number,
});

const transaksiSchema = new mongoose.Schema({
  id_transaksi: { type: String, unique: true },
  tanggal: { type: String, required: true }, // format: yyyy-MM-dd
  waktu: { type: String },
  kasir: { type: String, default: 'Admin' },
  metode_pembayaran: { type: String, required: true },
  items: [itemSchema],
  total: { type: Number, required: true },
  total_diskon: { type: Number, default: 0 },
  total_profit: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-generate id_transaksi
transaksiSchema.pre('save', async function(next) {
  if (!this.id_transaksi) {
    const dt = this.tanggal.replace(/-/g, '');
    const count = await this.constructor.countDocuments({ tanggal: this.tanggal });
    this.id_transaksi = `TRN-${dt}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Transaksi', transaksiSchema);

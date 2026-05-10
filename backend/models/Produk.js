const mongoose = require('mongoose');

const produkSchema = new mongoose.Schema({
  id_produk: { type: String, unique: true },
  nama: { type: String, required: true },
  kategori: { type: String, required: true },
  harga_jual: { type: Number, required: true },
  harga_modal: { type: Number, required: true },
  stok: { type: Number, default: 0 },
  satuan: { type: String, default: 'pcs' },
  aktif: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate id_produk
produkSchema.pre('save', async function(next) {
  if (!this.id_produk) {
    const last = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });
    const num = last ? parseInt(last.id_produk.replace('PRD-', '')) + 1 : 1;
    this.id_produk = `PRD-${String(num).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Produk', produkSchema);

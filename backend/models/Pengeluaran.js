const mongoose = require('mongoose');

const pengeluaranSchema = new mongoose.Schema({
  id_pengeluaran: { type: String, unique: true },
  tanggal: { type: String, required: true },
  keterangan: { type: String, required: true },
  kategori: { type: String },
  jumlah: { type: Number, required: true },
  kasir: { type: String, default: 'Admin' },
}, { timestamps: true });

pengeluaranSchema.pre('save', async function(next) {
  if (!this.id_pengeluaran) {
    const count = await this.constructor.countDocuments();
    this.id_pengeluaran = `OUT-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Pengeluaran', pengeluaranSchema);

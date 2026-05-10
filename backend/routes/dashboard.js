const express = require('express');
const router = express.Router();
const Transaksi = require('../models/Transaksi');
const Produk = require('../models/Produk');

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const bulanIni = today.slice(0, 7);

    // Harian
    const trxHari = await Transaksi.find({ tanggal: today });
    const totalHari = trxHari.reduce((s, t) => s + t.total, 0);
    const profitHari = trxHari.reduce((s, t) => s + t.total_profit, 0);

    // Bulanan
    const trxBulan = await Transaksi.find({ tanggal: { $regex: `^${bulanIni}` } });
    const totalBulan = trxBulan.reduce((s, t) => s + t.total, 0);
    const profitBulan = trxBulan.reduce((s, t) => s + t.total_profit, 0);

    // Produk terlaris bulan ini
    const produkQty = {};
    for (const t of trxBulan) {
      for (const item of t.items) {
        if (!produkQty[item.nama]) produkQty[item.nama] = 0;
        produkQty[item.nama] += item.qty;
      }
    }
    const produkTerlaris = Object.entries(produkQty)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nama, qty]) => ({ nama, qty }));

    // Stok menipis
    const stokMenipis = await Produk.find({ aktif: true, stok: { $lte: 10 } })
      .sort({ stok: 1 }).limit(5);

    // Chart 7 hari terakhir
    const chart7Hari = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const tgl = d.toISOString().split('T')[0];
      const label = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
      const trx = await Transaksi.find({ tanggal: tgl });
      const total = trx.reduce((s, t) => s + t.total, 0);
      chart7Hari.push({ tanggal: label, total });
    }

    res.json({
      harian: { total: totalHari, profit: profitHari, jml_transaksi: trxHari.length },
      bulanan: { total: totalBulan, profit: profitBulan },
      produk_terlaris: produkTerlaris,
      stok_menipis: stokMenipis,
      chart7Hari
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

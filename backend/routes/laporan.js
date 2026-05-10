const express = require('express');
const router = express.Router();
const Transaksi = require('../models/Transaksi');

// GET laporan harian
router.get('/harian', async (req, res) => {
  try {
    const { tanggal } = req.query;
    if (!tanggal) return res.status(400).json({ message: 'Parameter tanggal wajib' });

    const transaksi = await Transaksi.find({ tanggal }).sort({ waktu: 1 });
    const total = transaksi.reduce((s, t) => s + t.total, 0);
    const profit = transaksi.reduce((s, t) => s + t.total_profit, 0);

    res.json({ transaksi, total, profit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET laporan bulanan
router.get('/bulanan', async (req, res) => {
  try {
    const { bulan } = req.query; // format: yyyy-MM
    if (!bulan) return res.status(400).json({ message: 'Parameter bulan wajib' });

    const transaksi = await Transaksi.find({ tanggal: { $regex: `^${bulan}` } });

    // Group per hari
    const perHari = {};
    for (const t of transaksi) {
      if (!perHari[t.tanggal]) {
        perHari[t.tanggal] = { tanggal: t.tanggal, total: 0, profit: 0, jml_transaksi: 0 };
      }
      perHari[t.tanggal].total += t.total;
      perHari[t.tanggal].profit += t.total_profit;
      perHari[t.tanggal].jml_transaksi += 1;
    }

    const data = Object.values(perHari).sort((a, b) => a.tanggal > b.tanggal ? 1 : -1);
    const total = transaksi.reduce((s, t) => s + t.total, 0);
    const profit = transaksi.reduce((s, t) => s + t.total_profit, 0);

    res.json({ data, total, profit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

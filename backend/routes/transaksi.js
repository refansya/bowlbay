const express = require('express');
const router = express.Router();
const Transaksi = require('../models/Transaksi');
const Produk = require('../models/Produk');

// POST simpan transaksi baru
router.post('/', async (req, res) => {
  try {
    const { tanggal, waktu, kasir, metode_pembayaran, items } = req.body;

    // Hitung total
    let total = 0, total_diskon = 0, total_profit = 0;
    const itemsWithProfit = items.map(item => {
      const diskon_rp = Math.round(item.harga_jual * item.qty * (item.diskon_persen || 0) / 100);
      const subtotal = item.harga_jual * item.qty - diskon_rp;
      const profit = (item.harga_jual - item.harga_modal) * item.qty - diskon_rp;
      total += subtotal;
      total_diskon += diskon_rp;
      total_profit += profit;
      return { ...item, diskon_rp, subtotal, profit };
    });

    const transaksi = new Transaksi({
      tanggal, waktu, kasir, metode_pembayaran,
      items: itemsWithProfit,
      total, total_diskon, total_profit
    });

    const saved = await transaksi.save();

    // Kurangi stok tiap produk
    for (const item of items) {
      await Produk.findOneAndUpdate(
        { id_produk: item.id_produk },
        { $inc: { stok: -item.qty } }
      );
    }

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET list transaksi (dengan filter tanggal)
router.get('/', async (req, res) => {
  try {
    const { tanggal, bulan, limit = 50 } = req.query;
    let filter = {};
    if (tanggal) filter.tanggal = tanggal;
    else if (bulan) filter.tanggal = { $regex: `^${bulan}` };

    const data = await Transaksi.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Produk = require('../models/Produk');

// GET semua produk
router.get('/', async (req, res) => {
  try {
    const produk = await Produk.find().sort({ createdAt: -1 });
    res.json(produk);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET produk aktif saja
router.get('/aktif', async (req, res) => {
  try {
    const produk = await Produk.find({ aktif: true }).sort({ kategori: 1, nama: 1 });
    res.json(produk);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST tambah produk
router.post('/', async (req, res) => {
  try {
    const produk = new Produk(req.body);
    const saved = await produk.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update produk
router.put('/:id', async (req, res) => {
  try {
    const updated = await Produk.findOneAndUpdate(
      { id_produk: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH update stok
router.patch('/:id/stok', async (req, res) => {
  try {
    const { qty, jenis } = req.body; // jenis: 'tambah' | 'kurang'
    const produk = await Produk.findOne({ id_produk: req.params.id });
    if (!produk) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    produk.stok = jenis === 'kurang' ? produk.stok - qty : produk.stok + qty;
    await produk.save();
    res.json({ success: true, stok_baru: produk.stok });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE (nonaktifkan) produk
router.delete('/:id', async (req, res) => {
  try {
    await Produk.findOneAndUpdate({ id_produk: req.params.id }, { aktif: false });
    res.json({ success: true, message: 'Produk dinonaktifkan' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Routes
app.use('/api/produk', require('./routes/produk'));
app.use('/api/transaksi', require('./routes/transaksi'));
app.use('/api/laporan', require('./routes/laporan'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/', (req, res) => res.json({ status: 'BowlBay API running' }));

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

module.exports = app;
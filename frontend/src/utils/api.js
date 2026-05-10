import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
})

export const produkAPI = {
  getAll: () => api.get('/produk'),
  getAktif: () => api.get('/produk/aktif'),
  create: (data) => api.post('/produk', data),
  update: (id, data) => api.put(`/produk/${id}`, data),
  delete: (id) => api.delete(`/produk/${id}`),
}

export const transaksiAPI = {
  create: (data) => api.post('/transaksi', data),
  getList: (params) => api.get('/transaksi', { params }),
}

export const laporanAPI = {
  harian: (tanggal) => api.get('/laporan/harian', { params: { tanggal } }),
  bulanan: (bulan) => api.get('/laporan/bulanan', { params: { bulan } }),
}

export const dashboardAPI = {
  getData: () => api.get('/dashboard'),
}

export default api

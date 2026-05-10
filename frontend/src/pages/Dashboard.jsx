import { useState, useEffect } from 'react'
import { dashboardAPI } from '../utils/api'
import { rupiah } from '../utils/helpers'
import { toast } from '../components/Toast'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await dashboardAPI.getData()
      setData(res.data)
    } catch { toast('Gagal memuat dashboard', 'error') }
    setLoading(false)
  }

  const now = new Date()
  const hariIni = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  if (loading || !data) return (
    <div className="page">
      <div className="empty-state"><div className="icon">⏳</div>Memuat dashboard...</div>
    </div>
  )

  const maxChart = Math.max(...(data.chart7Hari?.map(d => d.total) || [1]), 1)
  const marginHari = data.harian?.total > 0 ? Math.round(data.harian.profit / data.harian.total * 100) : 0

  return (
    <div className="page">
      <div className="flex-between mb-4">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>🏠 Dashboard</h1>
          <p>{hariIni}</p>
        </div>
        <div className="flex-gap">
          <button className="btn btn-ghost btn-sm" onClick={loadData}>🔄 Refresh</button>
          <button className="btn btn-primary" onClick={() => navigate('/')}>+ Transaksi Baru</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card primary">
          <div className="stat-label">Transaksi Hari Ini</div>
          <div className="stat-value">{data.harian?.jml_transaksi || 0}</div>
          <div className="stat-sub">transaksi</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-label">Penjualan Hari Ini</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{rupiah(data.harian?.total)}</div>
          <div className="stat-sub">Profit: {rupiah(data.harian?.profit)}</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-label">Penjualan Bulan Ini</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{rupiah(data.bulanan?.total)}</div>
          <div className="stat-sub">Profit: {rupiah(data.bulanan?.profit)}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Margin Hari Ini</div>
          <div className="stat-value">{marginHari}%</div>
          <div className="stat-sub">dari penjualan</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Chart 7 hari */}
        <div className="card">
          <div className="card-title">📈 Penjualan 7 Hari Terakhir</div>
          <div className="bar-chart">
            {data.chart7Hari?.map((d, i) => (
              <div key={i} className="bar-wrap">
                <div className="bar" title={rupiah(d.total)} style={{ height: `${Math.max(4, (d.total / maxChart) * 100)}%` }} />
                <div className="bar-label">{d.tanggal}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Produk terlaris */}
        <div className="card">
          <div className="card-title">🏆 Produk Terlaris Bulan Ini</div>
          {!data.produk_terlaris?.length ? (
            <div className="empty-state" style={{ padding: 20 }}>Belum ada data</div>
          ) : data.produk_terlaris.map((p, i) => {
            const maxQty = data.produk_terlaris[0].qty
            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div className="flex-between" style={{ marginBottom: 4 }}>
                  <span>{i + 1}. {p.nama}</span>
                  <span className="text-accent mono">{p.qty} terjual</span>
                </div>
                <div style={{ background: 'var(--surface2)', borderRadius: 4, height: 6 }}>
                  <div style={{ background: 'var(--primary)', borderRadius: 4, height: '100%', width: `${(p.qty / maxQty) * 100}%`, transition: 'width .5s' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Stok menipis */}
        <div className="card">
          <div className="card-title">⚠️ Stok Menipis</div>
          {!data.stok_menipis?.length ? (
            <div className="empty-state" style={{ padding: 20 }}>✅ Semua stok aman</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Produk</th><th>Stok</th><th>Aksi</th></tr></thead>
                <tbody>
                  {data.stok_menipis.map(p => (
                    <tr key={p._id}>
                      <td>{p.nama}</td>
                      <td><span className={`badge ${p.stok === 0 ? 'badge-danger' : 'badge-warn'}`}>{p.stok} {p.satuan}</span></td>
                      <td><button className="btn btn-warn btn-sm" onClick={() => navigate('/produk')}>Restock</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-title">⚡ Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '🧾 Buka Kasir', path: '/', cls: 'btn-primary' },
              { label: '📦 Kelola Produk', path: '/produk', cls: 'btn-accent' },
              { label: '📊 Lihat Laporan', path: '/laporan', cls: 'btn-ghost' },
            ].map(a => (
              <button key={a.path} className={`btn ${a.cls} btn-block`} onClick={() => navigate(a.path)}>{a.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

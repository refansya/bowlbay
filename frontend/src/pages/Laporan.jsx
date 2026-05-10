import { useState, useEffect } from 'react'
import { laporanAPI } from '../utils/api'
import { rupiah, todayString, bulanString } from '../utils/helpers'
import { toast } from '../components/Toast'

export default function Laporan() {
  const [tab, setTab] = useState('harian')
  const [tanggal, setTanggal] = useState(todayString())
  const [bulan, setBulan] = useState(bulanString())
  const [dataHarian, setDataHarian] = useState(null)
  const [dataBulanan, setDataBulanan] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadHarian() }, [])

  const loadHarian = async () => {
    setLoading(true)
    try {
      const res = await laporanAPI.harian(tanggal)
      setDataHarian(res.data)
    } catch { toast('Gagal memuat laporan', 'error') }
    setLoading(false)
  }

  const loadBulanan = async () => {
    setLoading(true)
    try {
      const res = await laporanAPI.bulanan(bulan)
      setDataBulanan(res.data)
    } catch { toast('Gagal memuat laporan', 'error') }
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>📊 Laporan Penjualan</h1>
        <p>Lihat rekap penjualan harian dan bulanan</p>
      </div>

      {/* Tab */}
      <div className="flex-gap mb-4" style={{ borderBottom: '1px solid var(--border)', gap: 0 }}>
        {['harian', 'bulanan'].map(t => (
          <button key={t} className="btn btn-ghost"
            style={{ borderRadius: '8px 8px 0 0', borderBottom: tab === t ? '2px solid var(--primary)' : 'none', color: tab === t ? 'var(--primary)' : '' }}
            onClick={() => setTab(t)}>
            {t === 'harian' ? '📅 Harian' : '📆 Bulanan'}
          </button>
        ))}
      </div>

      {/* HARIAN */}
      {tab === 'harian' && (
        <div>
          <div className="flex-gap mb-4">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tanggal</label>
              <input type="date" className="form-input" value={tanggal} onChange={e => setTanggal(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={loadHarian}>🔍 Cari</button>
          </div>

          {dataHarian && (
            <>
              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                <div className="stat-card primary"><div className="stat-label">Transaksi</div><div className="stat-value">{dataHarian.transaksi?.length || 0}</div></div>
                <div className="stat-card accent"><div className="stat-label">Total Penjualan</div><div className="stat-value" style={{ fontSize: 16 }}>{rupiah(dataHarian.total)}</div></div>
                <div className="stat-card warn">
                  <div className="stat-label">Total Profit</div>
                  <div className="stat-value" style={{ fontSize: 16 }}>{rupiah(dataHarian.profit)}</div>
                  <div className="stat-sub">{dataHarian.total > 0 ? Math.round(dataHarian.profit / dataHarian.total * 100) : 0}% margin</div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Daftar Transaksi</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>ID Transaksi</th><th>Waktu</th><th>Item</th><th>Metode</th><th>Total</th><th>Profit</th></tr></thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={6} className="empty-state">Memuat...</td></tr>
                      ) : !dataHarian.transaksi?.length ? (
                        <tr><td colSpan={6} className="empty-state"><div className="icon">📋</div>Belum ada transaksi</td></tr>
                      ) : dataHarian.transaksi.map(t => (
                        <tr key={t._id}>
                          <td className="mono" style={{ fontSize: 12 }}><b>{t.id_transaksi}</b></td>
                          <td className="mono">{t.waktu}</td>
                          <td>{t.items?.map(i => `${i.nama} (${i.qty})`).join(', ')}</td>
                          <td><span className="badge badge-primary">{t.metode_pembayaran}</span></td>
                          <td className="mono text-accent"><b>{rupiah(t.total)}</b></td>
                          <td className="mono text-success">{rupiah(t.total_profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* BULANAN */}
      {tab === 'bulanan' && (
        <div>
          <div className="flex-gap mb-4">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Bulan</label>
              <input type="month" className="form-input" value={bulan} onChange={e => setBulan(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={loadBulanan}>🔍 Cari</button>
          </div>

          {dataBulanan && (
            <>
              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                <div className="stat-card primary"><div className="stat-label">Total Transaksi</div><div className="stat-value">{dataBulanan.data?.reduce((s, d) => s + d.jml_transaksi, 0) || 0}</div></div>
                <div className="stat-card accent"><div className="stat-label">Total Penjualan</div><div className="stat-value" style={{ fontSize: 16 }}>{rupiah(dataBulanan.total)}</div></div>
                <div className="stat-card warn">
                  <div className="stat-label">Total Profit</div>
                  <div className="stat-value" style={{ fontSize: 16 }}>{rupiah(dataBulanan.profit)}</div>
                  <div className="stat-sub">{dataBulanan.total > 0 ? Math.round(dataBulanan.profit / dataBulanan.total * 100) : 0}% margin</div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Rekap Per Hari</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Tanggal</th><th>Jumlah Transaksi</th><th>Total Penjualan</th><th>Profit</th><th>Margin</th></tr></thead>
                    <tbody>
                      {!dataBulanan.data?.length ? (
                        <tr><td colSpan={5} className="empty-state"><div className="icon">📆</div>Belum ada data</td></tr>
                      ) : [...dataBulanan.data].sort((a, b) => a.tanggal > b.tanggal ? 1 : -1).map(d => {
                        const margin = d.total > 0 ? Math.round(d.profit / d.total * 100) : 0
                        return (
                          <tr key={d.tanggal}>
                            <td className="mono">{d.tanggal}</td>
                            <td>{d.jml_transaksi} transaksi</td>
                            <td className="mono text-accent"><b>{rupiah(d.total)}</b></td>
                            <td className="mono text-success">{rupiah(d.profit)}</td>
                            <td><span className={`badge ${margin >= 30 ? 'badge-success' : margin >= 15 ? 'badge-warn' : 'badge-danger'}`}>{margin}%</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { printStruk, generateStrukHTML } from '../utils/print'
import { produkAPI, transaksiAPI } from '../utils/api'
import { rupiah, todayString, timeString } from '../utils/helpers'
import { toast } from '../components/Toast'

export default function Kasir() {
  const [produkList, setProdukList] = useState([])
  const [items, setItems] = useState([])
  const [selectedProduk, setSelectedProduk] = useState('')
  const [qty, setQty] = useState(1)
  const [diskon, setDiskon] = useState(0)
  const [metode, setMetode] = useState('')
  const [uangDiterima, setUangDiterima] = useState('')
  const [kasir, setKasir] = useState('Admin')
  const [tanggal, setTanggal] = useState(todayString())
  const [waktu, setWaktu] = useState(timeString())
  const [jam, setJam] = useState('')
  const [loading, setLoading] = useState(false)
  const [showStruk, setShowStruk] = useState(false)
  const [strukData, setStrukData] = useState('')
  const intervalRef = useRef(null)

  useEffect(() => {
    loadProduk()
    intervalRef.current = setInterval(() => {
      setJam(new Date().toLocaleTimeString('id-ID'))
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const loadProduk = async () => {
    try {
      const res = await produkAPI.getAktif()
      setProdukList(res.data)
    } catch {
      toast('Gagal memuat produk', 'error')
    }
  }

  const produkInfo = produkList.find(p => p.id_produk === selectedProduk)

  const tambahItem = () => {
    if (!selectedProduk) { toast('Pilih produk dulu!', 'error'); return }
    if (!produkInfo) return
    if (qty > produkInfo.stok) { toast(`Stok tidak cukup! Sisa: ${produkInfo.stok}`, 'error'); return }

    const diskonRp = Math.round(produkInfo.harga_jual * qty * diskon / 100)
    const subtotal = produkInfo.harga_jual * qty - diskonRp

    const existing = items.findIndex(x => x.id_produk === selectedProduk)
    if (existing >= 0) {
      const updated = [...items]
      updated[existing].qty += qty
      const dr = Math.round(updated[existing].harga_jual * updated[existing].qty * updated[existing].diskon_persen / 100)
      updated[existing].diskon_rp = dr
      updated[existing].subtotal = updated[existing].harga_jual * updated[existing].qty - dr
      setItems(updated)
    } else {
      setItems([...items, {
        id_produk: produkInfo.id_produk,
        nama: produkInfo.nama,
        harga_jual: produkInfo.harga_jual,
        harga_modal: produkInfo.harga_modal,
        qty, diskon_persen: diskon, diskon_rp: diskonRp, subtotal
      }])
    }
    setSelectedProduk(''); setQty(1); setDiskon(0)
  }

  const hapusItem = (idx) => setItems(items.filter((_, i) => i !== idx))

  const ubahQty = (idx, val) => {
    const q = parseInt(val) || 1
    const p = produkList.find(x => x.id_produk === items[idx].id_produk)
    if (p && q > p.stok) { toast('Melebihi stok!', 'error'); return }
    const updated = [...items]
    updated[idx].qty = q
    updated[idx].diskon_rp = Math.round(updated[idx].harga_jual * q * updated[idx].diskon_persen / 100)
    updated[idx].subtotal = updated[idx].harga_jual * q - updated[idx].diskon_rp
    setItems(updated)
  }

  const grandTotal = items.reduce((s, i) => s + i.subtotal, 0)
  const totalDiskon = items.reduce((s, i) => s + i.diskon_rp, 0)
  const kembalian = (parseFloat(uangDiterima) || 0) - grandTotal

  const selesaikan = async () => {
    if (!items.length) { toast('Tambahkan item dulu!', 'error'); return }
    if (!metode) { toast('Pilih metode pembayaran!', 'error'); return }
    if (metode === 'Cash' && (parseFloat(uangDiterima) || 0) < grandTotal) { toast('Uang tidak cukup!', 'error'); return }

    setLoading(true)
    try {
      const res = await transaksiAPI.create({ tanggal, waktu, kasir, metode_pembayaran: metode, items })
      const id = res.data.data.id_transaksi
      const strukHTML = generateStrukHTML({
  id, tanggal, waktu, kasir,
  items,
  grandTotal,
  totalDiskon,
  metode,
  uangDiterima: parseFloat(uangDiterima) || grandTotal,
  kembalian
})

// Auto-print ke printer thermal
printStruk(strukHTML)

// Tampilkan struk di modal
setStrukData(strukHTML)
setShowStruk(true)
setItems([])
setMetode('')
setUangDiterima('')
toast('Transaksi berhasil! Struk dicetak otomatis 🖨️', 'success')
loadProduk()
    } catch {
      toast('Gagal menyimpan transaksi', 'error')
    }
    setLoading(false)
  }

  // Group produk by kategori
  const grouped = produkList.reduce((acc, p) => {
    if (!acc[p.kategori]) acc[p.kategori] = []
    acc[p.kategori].push(p)
    return acc
  }, {})

  return (
    <div className="page">
      <div className="flex-between mb-4">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>🧾 Kasir</h1>
          <p>Input transaksi penjualan</p>
        </div>
        <div className="mono" style={{ color: 'var(--accent)', fontSize: 15, fontWeight: 600 }}>{jam}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }} className="kasir-layout">
        {/* KIRI */}
        <div>
          {/* Info Transaksi */}
          <div className="card">
            <div className="card-title">Info Transaksi</div>
            <div className="grid-3">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tanggal</label>
                <input type="date" className="form-input" value={tanggal} onChange={e => setTanggal(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Waktu</label>
                <input type="time" className="form-input" value={waktu} onChange={e => setWaktu(e.target.value)} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Kasir</label>
                <input type="text" className="form-input" value={kasir} onChange={e => setKasir(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Tambah Item */}
          <div className="card">
            <div className="card-title">Tambah Item</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Produk</label>
                <select className="form-select" value={selectedProduk} onChange={e => setSelectedProduk(e.target.value)}>
                  <option value="">-- Pilih Produk --</option>
                  {Object.entries(grouped).map(([kat, prods]) => (
                    <optgroup key={kat} label={kat}>
                      {prods.map(p => (
                        <option key={p.id_produk} value={p.id_produk}>
                          {p.nama} — {rupiah(p.harga_jual)} (stok: {p.stok})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Qty</label>
                  <input type="number" className="form-input" value={qty} min={1} onChange={e => setQty(parseInt(e.target.value) || 1)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Diskon %</label>
                  <input type="number" className="form-input" value={diskon} min={0} max={100} onChange={e => setDiskon(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              {produkInfo && (
                <div className="mt-2 text-muted" style={{ fontSize: 13 }}>
                  <span className="badge badge-primary">{produkInfo.kategori}</span>
                  &nbsp; Stok: <b>{produkInfo.stok} {produkInfo.satuan}</b>
                  &nbsp; Harga: <b>{rupiah(produkInfo.harga_jual)}</b>
                </div>
              )}
              <button className="btn btn-accent btn-block" onClick={tambahItem}>+ Tambah</button>
            </div>
          </div>

          {/* Tabel Item */}
          <div className="card">
            <div className="card-title">Item Transaksi</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Produk</th><th>Harga</th><th>Qty</th><th>Diskon</th><th>Subtotal</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={7} className="empty-state"><div className="icon">🛒</div>Belum ada item</td></tr>
                  ) : items.map((item, i) => (
                    <tr key={i}>
                      <td className="text-muted">{i + 1}</td>
                      <td><b>{item.nama}</b></td>
                      <td className="mono">{rupiah(item.harga_jual)}</td>
                      <td>
                        <input type="number" value={item.qty} min={1}
                          style={{ width: 60, background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', padding: '4px 8px', textAlign: 'center' }}
                          onChange={e => ubahQty(i, e.target.value)} />
                      </td>
                      <td className="text-danger">{item.diskon_persen > 0 ? `${item.diskon_persen}%` : '-'}</td>
                      <td className="mono text-accent"><b>{rupiah(item.subtotal)}</b></td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => hapusItem(i)}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* KANAN */}
        <div>
          <div className="card payment-panel" style={{ position: 'sticky', top: 80 }}>
            <div className="card-title">💳 Pembayaran</div>
            <div className="form-group">
              <label className="form-label">Metode Pembayaran</label>
              <select className="form-select" value={metode} onChange={e => setMetode(e.target.value)}>
                <option value="">-- Pilih Metode --</option>
                <option value="Cash">💵 Cash</option>
                <option value="Transfer Bank">🏦 Transfer Bank</option>
                <option value="QRIS">📱 QRIS</option>
              </select>
            </div>

            {metode === 'Cash' && (
              <div>
                <div className="form-group">
                  <label className="form-label">Uang Diterima</label>
                  <input type="number" className="form-input mono" placeholder="0"
                    value={uangDiterima} onChange={e => setUangDiterima(e.target.value)} />
                </div>
                <div className="flex-between" style={{ background: 'var(--surface2)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                  <span>Kembalian</span>
                  <span className="mono" style={{ color: kembalian < 0 ? 'var(--danger)' : 'var(--accent)' }}>
                    {rupiah(Math.max(0, kembalian))}
                  </span>
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 4 }}>
              <div className="flex-between mb-4">
                <span className="text-muted">Total Item</span>
                <span className="mono">{items.reduce((s, i) => s + i.qty, 0)} item</span>
              </div>
              <div className="flex-between mb-4">
                <span className="text-muted">Total Diskon</span>
                <span className="mono text-danger">{rupiah(totalDiskon)}</span>
              </div>
              <div className="flex-between" style={{ fontSize: 20, fontWeight: 800, margin: '12px 0 20px' }}>
                <span>TOTAL</span>
                <span className="mono text-accent">{rupiah(grandTotal)}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-block btn-lg" onClick={selesaikan} disabled={loading}>
              {loading ? '⏳ Menyimpan...' : '✅ Selesaikan Transaksi'}
            </button>
            <button className="btn btn-ghost btn-block mt-4" onClick={() => { setItems([]); setMetode(''); setUangDiterima('') }}>
              🗑️ Reset
            </button>
          </div>
        </div>
      </div>

      {/* Modal Struk */}
      {showStruk && (
        <div className="modal-overlay open">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">✅ Transaksi Berhasil</div>
            </div>
            <div dangerouslySetInnerHTML={{ __html: strukData }} 
              style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--surface2)', borderRadius: 8, padding: 20 }} />
              <button className="btn btn-ghost" onClick={() => printStruk(strukData)}>🖨️ Cetak Ulang</button>
            <div className="flex-gap mt-4" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => { setShowStruk(false); setTanggal(todayString()); setWaktu(timeString()) }}>
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

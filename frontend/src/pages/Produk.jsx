import { useState, useEffect } from 'react'
import { produkAPI } from '../utils/api'
import { rupiah } from '../utils/helpers'
import { toast } from '../components/Toast'

const emptyForm = { nama: '', kategori: '', harga_jual: '', harga_modal: '', stok: '', satuan: 'pcs', aktif: true }

export default function Produk() {
  const [produkList, setProdukList] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { loadProduk() }, [])

  const loadProduk = async () => {
    setLoading(true)
    try {
      const res = await produkAPI.getAll()
      setProdukList(res.data)
    } catch { toast('Gagal memuat produk', 'error') }
    setLoading(false)
  }

  const filtered = produkList.filter(p =>
    p.nama?.toLowerCase().includes(search.toLowerCase()) ||
    p.kategori?.toLowerCase().includes(search.toLowerCase())
  )

  const openTambah = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
  const openEdit = (p) => {
    setForm({ nama: p.nama, kategori: p.kategori, harga_jual: p.harga_jual, harga_modal: p.harga_modal, stok: p.stok, satuan: p.satuan, aktif: p.aktif })
    setEditId(p.id_produk)
    setShowModal(true)
  }

  const simpan = async () => {
    if (!form.nama || !form.kategori || !form.harga_jual) { toast('Lengkapi data produk!', 'error'); return }
    setLoading(true)
    try {
      if (editId) {
        await produkAPI.update(editId, { ...form, harga_jual: Number(form.harga_jual), harga_modal: Number(form.harga_modal), stok: Number(form.stok) })
        toast('Produk diupdate!', 'success')
      } else {
        await produkAPI.create({ ...form, harga_jual: Number(form.harga_jual), harga_modal: Number(form.harga_modal), stok: Number(form.stok) })
        toast('Produk ditambahkan!', 'success')
      }
      setShowModal(false)
      loadProduk()
    } catch { toast('Gagal menyimpan produk', 'error') }
    setLoading(false)
  }

  const nonaktifkan = async (id) => {
    if (!confirm('Nonaktifkan produk ini?')) return
    try {
      await produkAPI.delete(id)
      toast('Produk dinonaktifkan', 'success')
      loadProduk()
    } catch { toast('Gagal', 'error') }
  }

  const stats = {
    total: produkList.length,
    aktif: produkList.filter(p => p.aktif).length,
    menipis: produkList.filter(p => p.aktif && p.stok <= 10).length,
    habis: produkList.filter(p => p.stok === 0).length,
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>📦 Manajemen Produk</h1>
        <p>Kelola produk dan stok</p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[
          { label: 'Total Produk', value: stats.total, cls: 'primary' },
          { label: 'Produk Aktif', value: stats.aktif, cls: 'accent' },
          { label: 'Stok Menipis', value: stats.menipis, cls: 'warn', sub: '≤ 10 unit' },
          { label: 'Stok Habis', value: stats.habis, cls: 'danger' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            {s.sub && <div className="stat-sub">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="flex-between mb-4">
        <input className="form-input" style={{ maxWidth: 300 }} placeholder="🔍 Cari produk..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-accent" onClick={openTambah}>+ Tambah Produk</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Nama</th><th>Kategori</th><th>Harga Jual</th><th>Harga Modal</th><th>Stok</th><th>Status</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="empty-state">Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="empty-state"><div className="icon">📦</div>Belum ada produk</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id_produk}>
                <td className="mono" style={{ fontSize: 12 }}>{p.id_produk}</td>
                <td><b>{p.nama}</b></td>
                <td><span className="badge badge-primary">{p.kategori}</span></td>
                <td className="mono text-accent">{rupiah(p.harga_jual)}</td>
                <td className="mono text-muted">{rupiah(p.harga_modal)}</td>
                <td>
                  <span className={`badge ${p.stok === 0 ? 'badge-danger' : p.stok <= 10 ? 'badge-warn' : 'badge-success'}`}>
                    {p.stok} {p.satuan}
                  </span>
                </td>
                <td><span className={`badge ${p.aktif ? 'badge-success' : 'badge-danger'}`}>{p.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
                <td>
                  <div className="flex-gap">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️</button>
                    {p.aktif && <button className="btn btn-danger btn-sm" onClick={() => nonaktifkan(p.id_produk)}>🗑️</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editId ? '✏️ Edit Produk' : '➕ Tambah Produk'}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nama Produk</label>
                <input className="form-input" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <input className="form-input" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Harga Jual</label>
                <input type="number" className="form-input" value={form.harga_jual} onChange={e => setForm({ ...form, harga_jual: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Harga Modal</label>
                <input type="number" className="form-input" value={form.harga_modal} onChange={e => setForm({ ...form, harga_modal: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Stok</label>
                <input type="number" className="form-input" value={form.stok} onChange={e => setForm({ ...form, stok: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Satuan</label>
                <input className="form-input" value={form.satuan} onChange={e => setForm({ ...form, satuan: e.target.value })} />
              </div>
            </div>
            {editId && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.aktif} onChange={e => setForm({ ...form, aktif: e.target.value === 'true' })}>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            )}
            <div className="flex-gap" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={simpan} disabled={loading}>
                {loading ? '⏳' : '💾 Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

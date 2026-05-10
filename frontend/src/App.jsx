import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Toast from './components/Toast'
import Kasir from './pages/Kasir'
import Produk from './pages/Produk'
import Laporan from './pages/Laporan'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <div className="nav-brand">BowlBay</div>
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>🧾 Kasir</NavLink>
        <NavLink to="/produk" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>📦 Produk</NavLink>
        <NavLink to="/laporan" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>📊 Laporan</NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>🏠 Dashboard</NavLink>
      </nav>
      <Toast />
      <Routes>
        <Route path="/" element={<Kasir />} />
        <Route path="/produk" element={<Produk />} />
        <Route path="/laporan" element={<Laporan />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

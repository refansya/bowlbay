import { useState, useCallback, useEffect } from 'react'

let addToastFn = null

export const toast = (msg, type = 'info') => {
  if (addToastFn) addToastFn(msg, type)
}

export default function Toast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    addToastFn = (msg, type) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, msg, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }
    return () => { addToastFn = null }
  }, [])

  const icons = { success: '✅', error: '❌', info: 'ℹ️' }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-${t.type}`}
          style={{ padding: '12px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface2)', minWidth: 280, boxShadow: 'var(--shadow)', borderLeft: `3px solid var(--${t.type === 'success' ? 'success' : t.type === 'error' ? 'danger' : 'primary'})` }}>
          <span>{icons[t.type] || 'ℹ️'}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

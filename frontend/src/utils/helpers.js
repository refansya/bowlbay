export const rupiah = (n) =>
  'Rp ' + Number(n || 0).toLocaleString('id-ID')

export const todayString = () => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const bulanString = () => todayString().slice(0, 7)

export const timeString = () => new Date().toTimeString().slice(0, 5)

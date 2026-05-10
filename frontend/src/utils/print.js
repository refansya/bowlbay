// Print struk ke printer thermal 58mm
export const printStruk = (strukData) => {
  // Buat window baru khusus print
  const printWindow = window.open('', '_blank', 'width=300,height=600')

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Struk BowlBay</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          width: 58mm;
          padding: 2mm;
          color: #000;
          background: #fff;
        }

        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 3px 0; }
        .row { display: flex; justify-content: space-between; }
        .nama-toko { font-size: 14px; font-weight: bold; text-align: center; }
        .item-nama { font-size: 11px; }
        .item-detail { display: flex; justify-content: space-between; font-size: 11px; padding-left: 4px; }
        .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 12px; }
        .thankyou { text-align: center; font-size: 11px; margin-top: 4px; }

        @media print {
          @page {
            margin: 0;
            size: 58mm auto;
          }
          body {
            width: 58mm;
          }
        }
      </style>
    </head>
    <body>
      ${strukData}
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 1000);
        }
      <\/script>
    </body>
    </html>
  `)

  printWindow.document.close()
}

// Generate HTML struk dari data transaksi
export const generateStrukHTML = ({ id, tanggal, waktu, kasir, items, grandTotal, totalDiskon, metode, uangDiterima, kembalian }) => {
  const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

  let html = `
    <div class="nama-toko">BOWL BAY</div>
    <div class="center" style="font-size:10px">Terima kasih telah berkunjung</div>
    <div class="line"></div>
    <div class="row"><span>No</span><span>${id}</span></div>
    <div class="row"><span>Tgl</span><span>${tanggal}</span></div>
    <div class="row"><span>Waktu</span><span>${waktu}</span></div>
    <div class="row"><span>Kasir</span><span>${kasir}</span></div>
    <div class="line"></div>
  `

  for (const item of items) {
    html += `<div class="item-nama">${item.nama}</div>`
    html += `<div class="item-detail">
      <span>${item.qty} x ${rupiah(item.harga_jual)}${item.diskon_persen > 0 ? ` (-${item.diskon_persen}%)` : ''}</span>
      <span>${rupiah(item.subtotal)}</span>
    </div>`
  }

  html += `<div class="line"></div>`

  if (totalDiskon > 0) {
    html += `<div class="row"><span>Diskon</span><span>-${rupiah(totalDiskon)}</span></div>`
  }

  html += `<div class="total-row"><span>TOTAL</span><span>${rupiah(grandTotal)}</span></div>`
  html += `<div class="row"><span>Metode</span><span>${metode}</span></div>`

  if (metode === 'Cash') {
    html += `<div class="row"><span>Diterima</span><span>${rupiah(uangDiterima)}</span></div>`
    html += `<div class="row"><span>Kembalian</span><span>${rupiah(Math.max(0, kembalian))}</span></div>`
  }

  html += `
    <div class="line"></div>
    <div class="thankyou">=== Terima Kasih! ===</div>
    <div class="thankyou">Semoga hari Anda menyenangkan</div>
    <br><br><br>
  `

  return html
}
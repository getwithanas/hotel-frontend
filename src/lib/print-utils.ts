/**
 * Print / PDF export utilities
 * Uses window.print() with a dedicated print stylesheet approach
 */

export function printElement(elementId: string, title?: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || 'Print'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, sans-serif; padding: 24px; color: #1a1a2e; font-size: 13px; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        h2 { font-size: 16px; margin-bottom: 12px; color: #555; font-weight: 500; }
        h3 { font-size: 14px; margin: 16px 0 8px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-size: 12px; }
        th { background: #f8f8f8; font-weight: 600; }
        .header { border-bottom: 2px solid #1a1a2e; padding-bottom: 12px; margin-bottom: 16px; }
        .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #888; text-align: center; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; }
        .row .label { color: #666; }
        .row .value { font-weight: 600; }
        .total-row { font-size: 16px; border-top: 2px solid #1a1a2e; padding-top: 8px; margin-top: 8px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #f0f0f0; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0; }
        .stat-box { padding: 12px; border: 1px solid #e5e5e5; border-radius: 8px; text-align: center; }
        .stat-box .stat-value { font-size: 20px; font-weight: 700; }
        .stat-box .stat-label { font-size: 11px; color: #666; margin-top: 4px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      ${element.innerHTML}
      <div class="footer">Printed on ${new Date().toLocaleString()}</div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
}

export interface BillPrintData {
  billId: number;
  orderId: number;
  hotelName?: string;
  items: { name: string; qty: number; price: number; total: number }[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  paymentMethod: string;
  date: string;
}

export function printBill(data: BillPrintData) {
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) return;

  const itemRows = data.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td style="text-align:center">${i.qty}</td>
      <td style="text-align:right">$${i.price.toFixed(2)}</td>
      <td style="text-align:right">$${i.total.toFixed(2)}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bill #${data.billId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; padding: 16px; max-width: 320px; margin: 0 auto; font-size: 12px; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        hr { border: none; border-top: 1px dashed #333; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 3px 0; font-size: 11px; }
        th { text-align: left; border-bottom: 1px solid #333; }
        .right { text-align: right; }
        .total { font-size: 16px; font-weight: bold; }
        .footer { margin-top: 16px; text-align: center; font-size: 10px; color: #666; }
      </style>
    </head>
    <body>
      <div class="center bold" style="font-size:16px; margin-bottom:4px;">${data.hotelName || 'Restaurant'}</div>
      <div class="center" style="font-size:10px; margin-bottom:8px;">Bill #${data.billId} • Order #${data.orderId}</div>
      <div class="center" style="font-size:10px; margin-bottom:8px;">${new Date(data.date).toLocaleString()}</div>
      <hr>
      <table>
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th class="right">Price</th><th class="right">Total</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <hr>
      <div style="display:flex; justify-content:space-between;"><span>Subtotal</span><span>$${data.subtotal.toFixed(2)}</span></div>
      <div style="display:flex; justify-content:space-between;"><span>Tax (${data.taxRate}%)</span><span>$${data.taxAmount.toFixed(2)}</span></div>
      ${data.discount > 0 ? `<div style="display:flex; justify-content:space-between;"><span>Discount</span><span>-$${data.discount.toFixed(2)}</span></div>` : ''}
      <hr>
      <div style="display:flex; justify-content:space-between;" class="total"><span>TOTAL</span><span>$${data.total.toFixed(2)}</span></div>
      <div style="display:flex; justify-content:space-between; margin-top:8px;"><span>Payment</span><span class="bold">${data.paymentMethod}</span></div>
      <hr>
      <div class="footer">Thank you for dining with us!</div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
}

export function exportReportAsHTML(containerId: string, filename: string) {
  const element = document.getElementById(containerId);
  if (!element) return;

  const blob = new Blob([`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 32px; color: #1a1a2e; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { padding: 8px 12px; text-align: left; border: 1px solid #e5e5e5; }
        th { background: #f5f5f5; }
      </style>
    </head>
    <body>${element.innerHTML}</body>
    </html>
  `], { type: 'text/html' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

function escapeCsvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function exportToCSV(filename, columns, rows) {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => escapeCsvCell(row[c.key])).join(','));
  const csv = [header, ...lines].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToPDF(title, columns, rows) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  const headerHtml = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('');
  const bodyHtml = rows
    .map((row) => `<tr>${columns.map((c) => `<td>${escapeHtml(row[c.key])}</td>`).join('')}</tr>`)
    .join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
          h1 { font-size: 18px; color: #173528; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e6e6e6; font-size: 13px; }
          th { background: #f4f7fb; text-transform: uppercase; font-size: 11px; letter-spacing: 0.04em; color: #555; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <table>
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${bodyHtml || `<tr><td colspan="${columns.length}">No data</td></tr>`}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

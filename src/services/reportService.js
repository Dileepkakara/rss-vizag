export function downloadCsv(filename, headers, rows) {
  const csv = [headers, ...rows].map((line) => line.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const link = document.createElement('a');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

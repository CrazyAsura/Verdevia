import * as XLSX from 'xlsx';

export function downloadXlsx(filename: string, rows: Record<string, unknown>[]) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Relatório');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function printPdfReport(title: string, summary: Array<[string, string]>, chartRows: Array<{ label: string; value: number }>) {
  const max = Math.max(...chartRows.map((row) => row.value), 1);
  const bars = chartRows.map((row) => `<div class="bar-row"><span>${row.label}</span><div class="track"><i style="width:${(row.value / max) * 100}%"></i></div><b>${row.value.toLocaleString('pt-BR')}</b></div>`).join('');
  const metrics = summary.map(([label, value]) => `<div class="metric"><small>${label}</small><strong>${value}</strong></div>`).join('');
  const popup = window.open('', '_blank', 'noopener,noreferrer');
  if (!popup) return;
  popup.document.write(`<!doctype html><html lang="pt-BR"><head><title>${title}</title><style>body{font:14px Arial;color:#102a22;padding:32px}.head{border-bottom:3px solid #20c997;margin-bottom:24px}.head h1{margin:0 0 6px}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.metric{background:#f1fbf7;padding:16px;border-radius:8px}.metric small{display:block;color:#55726a}.metric strong{font-size:22px}.bar-row{display:grid;grid-template-columns:130px 1fr 75px;gap:10px;align-items:center;margin:14px 0}.track{height:18px;background:#e7f1ed;border-radius:99px;overflow:hidden}.track i{display:block;height:100%;background:#20c997;border-radius:99px}@media print{body{padding:12mm}}</style></head><body><section class="head"><h1>${title}</h1><p>Gerado em ${new Date().toLocaleString('pt-BR')}</p></section><section class="metrics">${metrics}</section><h2>Indicadores</h2>${bars}<script>window.onload=()=>window.print()</script></body></html>`);
  popup.document.close();
}

import type { CsvMetricRow, Verdict } from '../types/pinzit';

function downloadFile(content: string, name: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJSON(verdict: Verdict, fileName = 'pinzit_verdict_export.json') {
  downloadFile(JSON.stringify(verdict, null, 2), fileName, 'application/json');
}

export function exportCSV(rows: CsvMetricRow[], fileName = 'pinzit_stats_export.csv') {
  const csv = ['metric,value', ...rows.map((row) => `${row.metric},${row.value}`)].join('\n');
  downloadFile(csv, fileName, 'text/csv');
}

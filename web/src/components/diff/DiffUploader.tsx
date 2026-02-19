import { useState } from 'react';
import { parseCsv, parseVerdict } from '../../lib/parsers';
import { useRunStore } from '../../store/run-store';

export function DiffUploader() {
  const setComparisonRun = useRunStore((s) => s.setComparisonRun);
  const [vFile, setVFile] = useState<File | null>(null);
  const [cFile, setCFile] = useState<File | null>(null);

  const load = async () => {
    if (!vFile || !cFile) return;
    const verdict = parseVerdict(await vFile.text());
    const csvRows = parseCsv(await cFile.text());
    setComparisonRun({ verdict, csvRows, loadedAt: new Date().toISOString(), fileNames: { verdict: vFile.name, csv: cFile.name } });
  };

  return (
    <div className="panel mb-4 p-3">
      <p className="mb-2 text-sm text-zinc-300">Compare Run</p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <input type="file" accept=".json" onChange={(e) => setVFile(e.target.files?.[0] ?? null)} className="rounded border border-surface-600 bg-surface-800 p-2 text-xs" />
        <input type="file" accept=".csv" onChange={(e) => setCFile(e.target.files?.[0] ?? null)} className="rounded border border-surface-600 bg-surface-800 p-2 text-xs" />
        <button onClick={load} className="rounded border border-surface-600 px-3 py-2 text-sm hover:border-surface-500">Load comparison</button>
      </div>
    </div>
  );
}

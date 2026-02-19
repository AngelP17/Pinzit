import type { CsvMetricRow } from '../../types/pinzit';

export function StatsBar({ rows }: { rows: CsvMetricRow[] }) {
  return (
    <div className="panel grid grid-cols-1 gap-2 p-4 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.metric} className="rounded-md border border-surface-600 p-2">
          <p className="text-xs uppercase tracking-wide text-zinc-400">{row.metric}</p>
          <p className="font-mono text-lg">{row.value}</p>
        </div>
      ))}
    </div>
  );
}

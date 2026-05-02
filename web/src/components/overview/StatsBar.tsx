import type { CsvMetricRow } from '../../types/pinzit';

/* Retained for backwards compatibility but no longer rendered in OverviewTab. */
export function StatsBar({ rows }: { rows: CsvMetricRow[] }) {
  return (
    <div className="surface grid grid-cols-3 gap-px bg-white/5">
      {rows.map((row) => (
        <div key={row.metric} className="bg-paper-1 px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
            {row.metric.replace(/_/g, ' ')}
          </p>
          <p className="mt-1 font-mono text-lg text-white">{row.value}</p>
        </div>
      ))}
    </div>
  );
}

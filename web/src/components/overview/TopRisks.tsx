import type { FindingRow } from '../../types/pinzit';

export function TopRisks({ findings }: { findings: FindingRow[] }) {
  return (
    <div className="panel p-4">
      <h3 className="text-sm font-semibold text-zinc-300">Top Risks</h3>
      <div className="mt-3 space-y-2">
        {findings.slice(0, 3).map((row) => (
          <div key={row.id} className="rounded-md border border-surface-600 bg-surface-700/40 p-2">
            <p className="text-sm font-semibold">{row.id}</p>
            <p className="text-xs text-zinc-400">{row.severity} • {row.keyMetric}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

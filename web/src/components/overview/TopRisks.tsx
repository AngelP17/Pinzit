import type { FindingRow } from '../../types/pinzit';

export function TopRisks({ findings }: { findings: FindingRow[] }) {
  const prioritized = findings
    .filter((row) => row.verdict !== 'PASS')
    .slice(0, 3);

  if (prioritized.length === 0) {
    return (
      <div className="panel p-4">
        <h3 className="text-sm font-semibold text-zinc-300">Top Risks</h3>
        <div className="mt-3 rounded-md border border-pass/30 bg-pass/10 p-3">
          <p className="text-sm font-semibold text-pass">No active risks in this run</p>
          <p className="mt-1 text-xs text-zinc-300">
            All constraints are passing. Continue monitoring drift across comparison runs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel p-4">
      <h3 className="text-sm font-semibold text-zinc-300">Top Risks</h3>
      <div className="mt-3 space-y-2">
        {prioritized.map((row) => (
          <div key={row.id} className="rounded-md border border-fail/30 bg-fail/10 p-2">
            <p className="text-sm font-semibold text-zinc-100">{row.id}</p>
            <p className="text-xs text-zinc-300">
              {row.severity} • {row.keyMetric}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

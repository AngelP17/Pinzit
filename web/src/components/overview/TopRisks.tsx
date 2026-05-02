import type { FindingRow } from '../../types/pinzit';

export function TopRisks({ findings }: { findings: FindingRow[] }) {
  const prioritized = findings
    .filter((row) => row.verdict !== 'PASS')
    .slice(0, 3);

  return (
    <div className="surface p-6">
      <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
        <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">TOP RISKS</span>
        <span className="font-mono text-[11px] text-ink-2">{prioritized.length} active</span>
      </div>

      {prioritized.length === 0 ? (
        <div className="mt-5 flex items-start gap-3">
          <span className="mt-1 block h-2 w-2 rounded-full bg-pass" />
          <div>
            <p className="text-[15px] text-white">No active risks in this run.</p>
            <p className="mt-1 text-[13px] text-ink-1">
              All constraints are passing. Continue monitoring drift across comparison runs.
            </p>
          </div>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-white/10">
          {prioritized.map((row) => (
            <li key={row.id} className="grid grid-cols-12 gap-4 py-3">
              <span className="col-span-2 font-mono text-[12px] tracking-[0.18em] text-fail">{row.severity.toUpperCase()}</span>
              <span className="col-span-3 font-mono text-[12px] text-ink-1">{row.id}</span>
              <span className="col-span-7 text-[13.5px] text-ink-1">{row.keyMetric}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

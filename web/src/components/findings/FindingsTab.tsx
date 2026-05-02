import { Suspense, lazy } from 'react';
import { inferSeverity } from '../../lib/infer-severity';
import { useRunStore } from '../../store/run-store';
import type { RunBundle } from '../../types/pinzit';
import { EmptyState } from '../shared/EmptyState';
import { FindingsFilters } from './FindingsFilters';

const FindingsTable = lazy(() =>
  import('./FindingsTable').then((m) => ({ default: m.FindingsTable })),
);

export function FindingsTab({ run }: { run: RunBundle | null }) {
  const openEvidence = useRunStore((s) => s.openEvidence);
  const verdictFilter = useRunStore((s) => s.verdictFilter);

  if (!run) {
    return <EmptyState title="No findings yet" subtitle="Load a run to inspect constraint-level results." />;
  }

  const all = inferSeverity(run.verdict);
  const rows = all.filter((row) => verdictFilter.includes(row.verdict));
  const failCount = all.filter((r) => r.verdict === 'FAIL').length;

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">FINDINGS</span>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
            Constraint-level outcomes, prioritized by severity
          </h2>
          <p className="mt-1 text-sm text-ink-1">
            {failCount === 0 ? 'No active failures.' : `${failCount} active failure${failCount === 1 ? '' : 's'}.`}{' '}
            Click any row to open the evidence drawer.
          </p>
        </div>
        <FindingsFilters />
      </div>

      <Suspense fallback={<div className="text-sm text-ink-2">Loading table…</div>}>
        <FindingsTable rows={rows} onOpen={openEvidence} />
      </Suspense>
    </div>
  );
}

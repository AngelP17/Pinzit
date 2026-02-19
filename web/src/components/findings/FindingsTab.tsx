import { Suspense, lazy } from 'react';
import { inferSeverity } from '../../lib/infer-severity';
import { useRunStore } from '../../store/run-store';
import type { RunBundle } from '../../types/pinzit';
import { EmptyState } from '../shared/EmptyState';
import { FindingsFilters } from './FindingsFilters';

const FindingsTable = lazy(() =>
  import('./FindingsTable').then((m) => ({ default: m.FindingsTable }))
);

export function FindingsTab({ run }: { run: RunBundle | null }) {
  const openEvidence = useRunStore((s) => s.openEvidence);
  const verdictFilter = useRunStore((s) => s.verdictFilter);

  if (!run) {
    return <EmptyState title="No findings yet" subtitle="Load a run to inspect constraint-level results." />;
  }

  const rows = inferSeverity(run.verdict).filter((row) => verdictFilter.includes(row.verdict));

  return (
    <div>
      <FindingsFilters />
      <Suspense fallback={<div className="panel p-4 text-sm text-zinc-400">Loading table...</div>}>
        <FindingsTable rows={rows} onOpen={openEvidence} />
      </Suspense>
    </div>
  );
}

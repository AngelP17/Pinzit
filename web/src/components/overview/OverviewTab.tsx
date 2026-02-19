import { Suspense, lazy } from 'react';
import { inferSeverity } from '../../lib/infer-severity';
import { useRunStore } from '../../store/run-store';
import type { ConstraintId, RunBundle } from '../../types/pinzit';
import { EmptyState } from '../shared/EmptyState';
import { ScorecardCard } from './ScorecardCard';
import { StatsBar } from './StatsBar';
import { TopRisks } from './TopRisks';
import { VerdictBanner } from './VerdictBanner';

const PassFailDonut = lazy(() =>
  import('./PassFailDonut').then((m) => ({ default: m.PassFailDonut }))
);

export function OverviewTab({ run }: { run: RunBundle | null }) {
  const openEvidence = useRunStore((s) => s.openEvidence);

  if (!run) {
    return <EmptyState title="No run loaded" subtitle="Drop verdict and stats files or load sample data." />;
  }

  const findings = inferSeverity(run.verdict);

  return (
    <div className="space-y-[var(--density-gap)]">
      <VerdictBanner verdict={run.verdict.overall_verdict} />
      <StatsBar rows={run.csvRows} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {(Object.entries(run.verdict.constraints) as [ConstraintId, RunBundle['verdict']['constraints'][ConstraintId]][]).map(([id, result]) => (
          <ScorecardCard key={id} id={id} result={result} onClick={() => openEvidence(id)} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<div className="panel h-72 p-4 text-sm text-zinc-400">Loading chart...</div>}>
          <PassFailDonut verdict={run.verdict} />
        </Suspense>
        <TopRisks findings={findings} />
      </div>
    </div>
  );
}

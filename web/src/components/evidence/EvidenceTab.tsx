import type { RunBundle } from '../../types/pinzit';
import { useRunStore } from '../../store/run-store';
import { EmptyState } from '../shared/EmptyState';

export function EvidenceTab({ run }: { run: RunBundle | null }) {
  const openEvidence = useRunStore((s) => s.openEvidence);

  if (!run) {
    return <EmptyState title="No evidence loaded" subtitle="Select a row from Findings or a scorecard from Overview." />;
  }

  return (
    <div className="space-y-[var(--density-gap)]">
      <div className="tab-header">
        <div>
          <h2 className="tab-title">Evidence</h2>
          <p className="tab-subtitle">Open any constraint to inspect decision trace, metrics, and evidence spans.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(
          Object.entries(run.verdict.constraints) as [
            keyof RunBundle['verdict']['constraints'],
            RunBundle['verdict']['constraints'][keyof RunBundle['verdict']['constraints']]
          ][]
        ).map(([id, result]) => (
          <button
            key={id}
            onClick={() => openEvidence(id)}
            className="panel cursor-pointer p-4 text-left transition-colors hover:border-surface-500 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <p className="text-sm font-semibold text-white">{id}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400">{result.verdict}</p>
            <p className="mt-3 text-sm text-zinc-300">
              Evidence spans: <span className="font-mono">{result.evidence_spans.length}</span>
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

import type { RunBundle, ConstraintId, ConstraintResult } from '../../types/pinzit';
import { useRunStore } from '../../store/run-store';
import { EmptyState } from '../shared/EmptyState';
import { Target, CheckCircle, Warning, Lightbulb, ArrowRight } from '@phosphor-icons/react';

function EvidenceCard({ id, result, onClick }: { id: ConstraintId; result: ConstraintResult; onClick: () => void }) {
  const metrics = result.metrics as Record<string, unknown>;

  const thresholdKey = (() => {
    if (id === 'slfs_001') return 'safe_state_deadline_ms';
    if (id === 'rtcb_002') return 'max_recovery_ms';
    if (id === 'brc_003') return 'containment_timeout_ms';
    return null;
  })();

  const observedKey = (() => {
    if (id === 'slfs_001') return 'unsafe_after_loss_count';
    if (id === 'rtcb_002') return 'max_recovery_ms_seen';
    if (id === 'brc_003') return 'containment_latency_ms';
    return null;
  })();

  const threshold = thresholdKey ? metrics[thresholdKey] : null;
  const observed = observedKey ? metrics[observedKey] : null;

  const verdictColor = result.verdict === 'PASS' ? 'text-pass' : result.verdict === 'FAIL' ? 'text-fail' : 'text-skip';
  const verdictBorder = result.verdict === 'PASS' ? 'border-l-pass' : result.verdict === 'FAIL' ? 'border-l-fail' : 'border-l-skip';
  const verdictIcon = result.verdict === 'PASS' ? <CheckCircle size={16} weight="duotone" className="text-pass" /> : <Warning size={16} weight="duotone" className="text-fail" />;

  return (
    <button
      onClick={onClick}
      className={`panel cursor-pointer border-l-4 p-5 text-left transition-colors hover:border-surface-500 focus-visible:ring-2 focus-visible:ring-blue-500 ${verdictBorder}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} weight="duotone" className="text-[#00f0ff]" />
          <span className="text-sm font-semibold text-white">{id}</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide">
          {verdictIcon}
          <span className={verdictColor}>{result.verdict}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {threshold !== undefined && (
          <div className="rounded-lg border border-surface-600 bg-surface-800/50 p-2">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Threshold</p>
            <p className="mt-0.5 font-mono text-xs text-white">{String(threshold)}</p>
          </div>
        )}
        {observed !== undefined && (
          <div className="rounded-lg border border-surface-600 bg-surface-800/50 p-2">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Observed</p>
            <p className={`mt-0.5 font-mono text-xs ${Number(observed) > Number(threshold) ? 'text-fail' : 'text-white'}`}>
              {String(observed)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">Evidence Spans</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {result.evidence_spans.length > 0 ? (
            result.evidence_spans.map((span, i) => (
              <span key={`${span}-${i}`} className="inline-block rounded bg-surface-700 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
                {span}
              </span>
            ))
          ) : (
            <span className="text-xs text-zinc-500">None</span>
          )}
        </div>
      </div>

      {result.recommendations.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#00f0ff]/5 p-2">
          <Lightbulb size={14} weight="duotone" className="mt-0.5 text-[#00f0ff]" />
          <p className="text-xs text-zinc-300">{result.recommendations[0]}</p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 text-xs text-[#00f0ff]">
        <span>Inspect details</span>
        <ArrowRight size={12} weight="duotone" />
      </div>
    </button>
  );
}

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
          <p className="tab-subtitle">Thresholds, observed values, evidence spans, recommendations, and verdict reasons per constraint.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(
          Object.entries(run.verdict.constraints) as [
            ConstraintId,
            ConstraintResult
          ][]
        ).map(([id, result]) => (
          <EvidenceCard key={id} id={id} result={result} onClick={() => openEvidence(id)} />
        ))}
      </div>
    </div>
  );
}

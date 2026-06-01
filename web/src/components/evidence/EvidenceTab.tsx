import { ArrowRight } from '@phosphor-icons/react';
import { useRunStore } from '../../store/run-store';
import type { ConstraintId, ConstraintResult, RunBundle } from '../../types/pinzit';
import { EmptyState } from '../shared/EmptyState';

const labels: Record<ConstraintId, string> = {
  slfs_001: 'Fail-Safe Fallback',
  rtcb_002: 'Recovery Time Bound',
  brc_003: 'Blast Radius Containment',
};

function thresholdAndObserved(id: ConstraintId, result: ConstraintResult): { thresholdLabel?: string; observedLabel?: string } {
  const m = result.metrics as Record<string, unknown>;
  if (id === 'slfs_001') return { thresholdLabel: `safe_state_deadline_ms: ${m.safe_state_deadline_ms ?? '-'}`, observedLabel: `unsafe_after_loss_count: ${m.unsafe_after_loss_count ?? 0}` };
  if (id === 'rtcb_002') return { thresholdLabel: `max_recovery_ms: ${m.max_recovery_ms ?? '-'}`, observedLabel: `max_recovery_ms_seen: ${m.max_recovery_ms_seen ?? 0}` };
  if (id === 'brc_003')  return { thresholdLabel: `containment_timeout_ms: ${m.containment_timeout_ms ?? '-'}`, observedLabel: `containment_latency_ms: ${m.containment_latency_ms ?? 0}` };
  return {};
}

function EvidenceCard({ id, result, onClick }: { id: ConstraintId; result: ConstraintResult; onClick: () => void }) {
  const { thresholdLabel, observedLabel } = thresholdAndObserved(id, result);
  const verdictTone = result.verdict === 'PASS'
    ? 'border-pass/40 text-pass'
    : result.verdict === 'FAIL'
      ? 'border-fail/40 text-fail'
      : 'border-skip/40 text-skip';

  return (
    <button onClick={onClick} className="surface group flex h-full w-full flex-col p-6 text-left transition-colors hover:border-white/25">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <span className="font-mono text-[11px] tracking-[0.18em] text-ink-2 uppercase">{id}</span>
        <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.18em] ${verdictTone}`}>
          {result.verdict}
        </span>
      </div>

      <h3 className="mt-4 text-[16px] font-medium tracking-tight text-white">{labels[id]}</h3>

      <dl className="mt-5 grid grid-cols-2 gap-px bg-white/5">
        <div className="bg-paper-1 px-3 py-2.5">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">Threshold</dt>
          <dd className="mt-1 font-mono text-[12px] text-ink-1 break-all">{thresholdLabel ?? '-'}</dd>
        </div>
        <div className="bg-paper-1 px-3 py-2.5">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">Observed</dt>
          <dd className="mt-1 font-mono text-[12px] text-ink-1 break-all">{observedLabel ?? '-'}</dd>
        </div>
      </dl>

      <div className="mt-5 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">Evidence spans</p>
        <ul className="mt-2 space-y-1.5">
          {(result.evidence_spans ?? []).map((span, i) => (
            <li key={`${span}-${i}`} className="flex items-center gap-2 font-mono text-[12px] text-ink-1">
              <span className="block h-1.5 w-1.5 rounded-full bg-signal" />
              <span className="break-all">{span}</span>
            </li>
          ))}
          {(result.evidence_spans?.length ?? 0) === 0 ? (
            <li className="font-mono text-[12px] text-ink-2">No evidence spans recorded.</li>
          ) : null}
        </ul>
      </div>

      {result.recommendations?.[0] ? (
        <p className="mt-5 border-t border-white/10 pt-4 text-[12.5px] leading-relaxed text-ink-1">
          {result.recommendations[0]}
        </p>
      ) : null}

      <div className="mt-5 flex items-center justify-end font-mono text-[11px] text-ink-2 transition-colors group-hover:text-white">
        Inspect details <ArrowRight size={11} weight="bold" className="ml-1" />
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
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">EVIDENCE</span>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
            Per-constraint thresholds & evidence spans
          </h2>
          <p className="mt-1 text-sm text-ink-1">Click any card to open the inspector drawer.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(Object.entries(run.verdict.constraints) as [ConstraintId, ConstraintResult][]).map(([id, result]) => (
          <EvidenceCard key={id} id={id} result={result} onClick={() => openEvidence(id)} />
        ))}
      </div>
    </div>
  );
}

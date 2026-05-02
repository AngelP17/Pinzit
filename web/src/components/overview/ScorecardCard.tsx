import { ArrowsClockwise, Network, Shield } from '@phosphor-icons/react';
import type { ConstraintId, ConstraintResult } from '../../types/pinzit';

const iconMap = {
  slfs_001: Shield,
  rtcb_002: ArrowsClockwise,
  brc_003: Network,
};

const labels: Record<ConstraintId, string> = {
  slfs_001: 'Fail-Safe Fallback',
  rtcb_002: 'Recovery Time Bound',
  brc_003: 'Blast Radius Containment',
};

export function ScorecardCard({
  id,
  result,
  onClick,
}: {
  id: ConstraintId;
  result: ConstraintResult;
  onClick: () => void;
}) {
  const Icon = iconMap[id];
  const metricEntry = Object.entries(result.metrics as Record<string, unknown>)[0];
  const tone =
    result.verdict === 'PASS' ? 'border-pass/40 text-pass' :
    result.verdict === 'FAIL' ? 'border-fail/40 text-fail' :
    'border-skip/40 text-skip';

  return (
    <button
      onClick={onClick}
      className="surface group flex h-full w-full flex-col items-stretch gap-5 p-6 text-left transition-colors hover:border-white/25"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <Icon size={16} weight="duotone" className="text-ink-1" />
          <span className="font-mono text-[12px] tracking-[0.18em] text-ink-1 uppercase">{id}</span>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.18em] ${tone}`}>
          {result.verdict}
        </span>
      </div>

      <div>
        <p className="text-[15.5px] font-medium leading-snug text-white tracking-tight">{labels[id]}</p>
        <p className="mt-3 font-mono text-[12px] text-ink-2 break-all">
          {metricEntry ? `${metricEntry[0]}: ${String(metricEntry[1])}` : 'No metrics'}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-[11px] text-ink-2">
        <span>{result.evidence_spans?.length ?? 0} evidence span{(result.evidence_spans?.length ?? 0) === 1 ? '' : 's'}</span>
        <span className="text-ink-1 transition-colors group-hover:text-white">Inspect →</span>
      </div>
    </button>
  );
}

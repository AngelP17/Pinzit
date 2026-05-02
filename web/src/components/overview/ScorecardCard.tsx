import { Network, ArrowsClockwise, Shield } from '@phosphor-icons/react';
import type { ConstraintId, ConstraintResult } from '../../types/pinzit';
import { VerdictBadge } from '../shared/VerdictBadge';

const iconMap = {
  slfs_001: Shield,
  rtcb_002: ArrowsClockwise,
  brc_003: Network,
};

const labels = {
  slfs_001: 'Fail-Safe Fallback',
  rtcb_002: 'Recovery Time Bound',
  brc_003: 'Blast Radius Containment',
};

export function ScorecardCard({ id, result, onClick }: { id: ConstraintId; result: ConstraintResult; onClick: () => void }) {
  const Icon = iconMap[id];
  const metricEntry = Object.entries(result.metrics as Record<string, unknown>)[0];

  return (
    <button onClick={onClick} className={`panel cursor-pointer p-4 text-left transition-colors hover:border-surface-500 ${result.verdict === 'FAIL' ? 'border-l-4 border-l-fail' : result.verdict === 'PASS' ? 'border-l-4 border-l-pass' : 'border-l-4 border-l-skip'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><Icon size={16} weight="duotone" /><span className="font-semibold">{id}</span></div>
        <VerdictBadge verdict={result.verdict} />
      </div>
      <p className="mt-1 text-sm text-zinc-300">{labels[id]}</p>
      <p className="mt-3 font-mono text-sm text-zinc-200">{metricEntry ? `${metricEntry[0]}: ${String(metricEntry[1])}` : 'No metrics'}</p>
    </button>
  );
}

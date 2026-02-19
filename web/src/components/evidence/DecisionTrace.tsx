import type { ConstraintResult } from '../../types/pinzit';

export function DecisionTrace({ result }: { result: ConstraintResult }) {
  const metric = Object.entries(result.metrics as Record<string, unknown>)[0];
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-zinc-300">Decision Trace</h4>
      <div className="rounded-md border border-surface-600 p-3">
        <p className="text-sm"><span className="text-zinc-400">Inputs:</span> evidence={result.evidence_spans.length}</p>
        <p className="text-sm"><span className="text-zinc-400">Rule:</span> constraint-specific threshold evaluation</p>
        <p className="text-sm"><span className="text-zinc-400">Threshold:</span> {metric ? `${metric[0]}=${String(metric[1])}` : 'n/a'}</p>
        <p className="text-sm"><span className="text-zinc-400">Verdict:</span> {result.verdict}</p>
      </div>
    </div>
  );
}

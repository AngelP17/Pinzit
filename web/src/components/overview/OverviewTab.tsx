import { Suspense, lazy } from 'react';
import { inferSeverity } from '../../lib/infer-severity';
import { useRunStore } from '../../store/run-store';
import type { ConstraintId, RunBundle } from '../../types/pinzit';
import { EmptyState } from '../shared/EmptyState';
import { ScorecardCard } from './ScorecardCard';
import { TopRisks } from './TopRisks';

const PassFailDonut = lazy(() =>
  import('./PassFailDonut').then((m) => ({ default: m.PassFailDonut })),
);

export function OverviewTab({ run }: { run: RunBundle | null }) {
  const openEvidence = useRunStore((s) => s.openEvidence);

  if (!run) {
    return <EmptyState title="No run loaded" subtitle="Drop verdict and stats files or load sample data." />;
  }

  const findings = inferSeverity(run.verdict);
  const verdict = run.verdict.overall_verdict;
  const verdictTone = verdict === 'PASS' ? 'text-pass' : verdict === 'FAIL' ? 'text-fail' : 'text-skip';
  const constraints = Object.entries(run.verdict.constraints) as [
    ConstraintId,
    RunBundle['verdict']['constraints'][ConstraintId],
  ][];
  const passCount = constraints.filter(([, c]) => c.verdict === 'PASS').length;
  const failCount = constraints.filter(([, c]) => c.verdict === 'FAIL').length;
  const parsedSpanCount =
    run.verdict.summary?.parsed_span_count ??
    Number(run.csvRows.find((r) => r.metric === 'parsed_span_count')?.value ?? 0);
  const runId = run.verdict.metadata?.run_id ?? 'pinzit_local_run';

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">OVERVIEW</span>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
            Reliability posture at a glance
          </h2>
          <p className="mt-1 text-sm text-ink-1">
            Bento manifest. Hover any cell to inspect; click constraint cards to open evidence.
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[12px] text-ink-2">
          <span><span className="text-pass">{passCount}</span> pass</span>
          <span><span className="text-fail">{failCount}</span> fail</span>
          <span>{parsedSpanCount} spans</span>
        </div>
      </div>

      {/* Editorial bento — 6-col grid, dense flow, zero empty cells */}
      <div className="grid grid-cols-6 gap-4 [grid-auto-flow:dense]">
        {/* Verdict banner — 4×2 */}
        <div className="surface col-span-6 row-span-2 p-7 lg:col-span-4">
          <div className="flex h-full items-stretch gap-8">
            <div className="flex-1">
              <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">OVERALL VERDICT</span>
              <p className={`display display-mega mt-3 ${verdictTone}`}>{verdict}</p>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-1">
                {verdict === 'PASS'
                  ? `${passCount} of ${constraints.length} constraints satisfied across ${parsedSpanCount} parsed spans.`
                  : verdict === 'FAIL'
                    ? `${failCount} constraint${failCount === 1 ? '' : 's'} violated. Review findings below.`
                    : 'Run skipped before reaching a verdict.'}
              </p>
            </div>
            <div className="hidden w-px bg-white/10 md:block" />
            <div className="hidden flex-col justify-between md:flex">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-ink-2">RUN ID</p>
                <p className="mt-1 font-mono text-[12px] text-ink-1">{runId.slice(0, 22)}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-ink-2">EXIT CODE</p>
                <p className={`mt-1 font-mono text-3xl ${verdictTone}`}>{verdict === 'PASS' ? 0 : verdict === 'FAIL' ? 1 : 2}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution donut — 2×2 */}
        <div className="surface col-span-6 row-span-2 p-5 lg:col-span-2">
          <Suspense fallback={<div className="text-sm text-ink-2">Loading chart…</div>}>
            <PassFailDonut verdict={run.verdict} />
          </Suspense>
        </div>

        {/* Three constraint scorecards — 2×2 each */}
        {constraints.map(([id, result]) => (
          <div key={id} className="col-span-6 row-span-2 lg:col-span-2">
            <ScorecardCard id={id} result={result} onClick={() => openEvidence(id)} />
          </div>
        ))}

        {/* Stats strip — full width row */}
        <div className="surface col-span-6 row-span-1 grid grid-cols-3 gap-px bg-white/5">
          {run.csvRows.map((row) => (
            <div key={row.metric} className="bg-paper-1 px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
                {row.metric.replace(/_/g, ' ')}
              </p>
              <p className="mt-1 font-mono text-lg text-white">{row.value}</p>
            </div>
          ))}
        </div>

        {/* Top risks — 6×2 */}
        <div className="col-span-6 row-span-2">
          <TopRisks findings={findings} />
        </div>
      </div>
    </div>
  );
}

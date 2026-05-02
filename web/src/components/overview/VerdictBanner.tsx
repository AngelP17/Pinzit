import type { VerdictState } from '../../types/pinzit';

/* Retained for backwards compatibility — the new OverviewTab renders an inline editorial banner. */
export function VerdictBanner({ verdict }: { verdict: VerdictState }) {
  const cls =
    verdict === 'FAIL' ? 'text-fail' :
    verdict === 'PASS' ? 'text-pass' :
    'text-skip';
  return (
    <div className="surface p-7">
      <p className="font-mono text-[11px] tracking-[0.22em] text-ink-2">OVERALL VERDICT</p>
      <p className={`display display-xl mt-2 ${cls}`}>{verdict}</p>
    </div>
  );
}

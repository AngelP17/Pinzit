import type { RunBundle } from '../../types/pinzit';

export function DiffBanner({ base, next }: { base: RunBundle; next: RunBundle }) {
  const ids = Object.keys(base.verdict.constraints) as (keyof typeof base.verdict.constraints)[];
  let regressions = 0;
  let improvements = 0;
  ids.forEach((id) => {
    const prev = base.verdict.constraints[id].verdict;
    const curr = next.verdict.constraints[id].verdict;
    if (prev === 'PASS' && curr === 'FAIL')     regressions += 1;
    if (prev === 'FAIL' && curr === 'PASS') improvements += 1;
  });

  return <div className="panel mb-4 border-fail/30 p-4 text-sm">{regressions} regressions, {improvements} improvements</div>;
}

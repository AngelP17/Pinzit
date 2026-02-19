import { VerdictBadge } from '../shared/VerdictBadge';
import type { VerdictState } from '../../types/pinzit';

export function VerdictBanner({ verdict }: { verdict: VerdictState }) {
  const cls = verdict === 'FAIL' ? 'text-fail animate-pulseSoft' : verdict === 'PASS' ? 'text-pass' : 'text-skip';
  return (
    <div className="panel p-6 text-center">
      <p className="text-xs uppercase tracking-widest text-zinc-400">Overall Verdict</p>
      <h2 className={`mt-1 text-4xl font-black ${cls}`}>{verdict}</h2>
      <div className="mt-2"><VerdictBadge verdict={verdict} /></div>
    </div>
  );
}

import { cn } from '../../lib/cn';
import type { VerdictState } from '../../types/pinzit';

const styles: Record<VerdictState, string> = {
  PASS: 'bg-pass/15 text-pass border-pass/40',
  FAIL: 'bg-fail/15 text-fail border-fail/40',
  SKIPPED: 'bg-skip/15 text-skip border-skip/40',
};

export function VerdictBadge({ verdict, className }: { verdict: VerdictState; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', styles[verdict], className)}>
      {verdict}
    </span>
  );
}

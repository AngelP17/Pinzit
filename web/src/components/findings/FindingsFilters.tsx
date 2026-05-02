import { useRunStore } from '../../store/run-store';
import type { VerdictState } from '../../types/pinzit';

const values: VerdictState[] = ['PASS', 'FAIL', 'SKIPPED'];

const tone: Record<VerdictState, string> = {
  PASS: 'text-pass border-pass/40 bg-pass/10',
  FAIL: 'text-fail border-fail/40 bg-fail/10',
  SKIPPED: 'text-skip border-skip/40 bg-skip/10',
};

export function FindingsFilters() {
  const filter = useRunStore((s) => s.verdictFilter);
  const setFilter = useRunStore((s) => s.setVerdictFilter);

  const toggle = (value: VerdictState) => {
    setFilter(filter.includes(value) ? filter.filter((v) => v !== value) : [...filter, value]);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">FILTER</span>
      {values.map((value) => {
        const on = filter.includes(value);
        return (
          <button
            key={value}
            onClick={() => toggle(value)}
            className={`rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.18em] transition-colors ${
              on ? tone[value] : 'border-white/10 text-ink-2 hover:border-white/30 hover:text-ink-1'
            }`}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}

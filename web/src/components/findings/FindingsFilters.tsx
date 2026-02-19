import { useRunStore } from '../../store/run-store';
import type { VerdictState } from '../../types/pinzit';

const values: VerdictState[] = ['PASS', 'FAIL', 'SKIPPED'];

export function FindingsFilters() {
  const filter = useRunStore((s) => s.verdictFilter);
  const setFilter = useRunStore((s) => s.setVerdictFilter);

  const toggle = (value: VerdictState) => {
    if (filter.includes(value)) {
      setFilter(filter.filter((v) => v !== value));
    } else {
      setFilter([...filter, value]);
    }
  };

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {values.map((value) => (
        <button
          key={value}
          onClick={() => toggle(value)}
          className={`rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:ring-blue-500 ${
            filter.includes(value)
              ? 'border-pass bg-pass/10 text-pass'
              : 'border-surface-600 text-zinc-300 hover:border-surface-500'
          }`}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

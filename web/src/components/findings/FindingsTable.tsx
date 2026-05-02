import type { FindingRow } from '../../types/pinzit';

const verdictTone: Record<FindingRow['verdict'], string> = {
  PASS: 'text-pass',
  FAIL: 'text-fail',
  SKIPPED: 'text-skip',
};

const severityTone: Record<string, string> = {
  Low: 'text-ink-1',
  Medium: 'text-skip',
  High: 'text-fail',
  Critical: 'text-fail',
};

/* Editorial list — no spreadsheet rows, no zebra stripes. */
export function FindingsTable({
  rows,
  onOpen,
}: {
  rows: FindingRow[];
  onOpen: (id: FindingRow['id']) => void;
}) {
  if (rows.length === 0) {
    return (
      <p className="surface px-6 py-8 text-center text-[14px] text-ink-2">
        No findings match the current filter.
      </p>
    );
  }

  return (
    <div className="surface overflow-hidden">
      <div className="grid grid-cols-12 gap-4 border-b border-white/10 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">
        <span className="col-span-2">Severity</span>
        <span className="col-span-2">Constraint</span>
        <span className="col-span-5">Key metric</span>
        <span className="col-span-2 text-right">Evidence</span>
        <span className="col-span-1 text-right">Verdict</span>
      </div>
      <ul>
        {rows.map((row, idx) => (
          <li
            key={`${row.id}-${idx}`}
            onClick={() => onOpen(row.id)}
            className="group grid cursor-pointer grid-cols-12 items-baseline gap-4 border-b border-white/5 px-6 py-4 transition-colors last:border-b-0 hover:bg-white/[0.02]"
          >
            <span className={`col-span-2 font-mono text-[12px] tracking-[0.16em] uppercase ${severityTone[row.severity] ?? 'text-ink-1'}`}>
              {row.severity}
            </span>
            <span className="col-span-2 font-mono text-[13px] text-white">{row.id}</span>
            <span className="col-span-5 font-mono text-[12.5px] text-ink-1 break-words">{row.keyMetric}</span>
            <span className="col-span-2 text-right font-mono text-[12px] text-ink-2">{row.evidenceCount}</span>
            <span className={`col-span-1 text-right font-mono text-[11px] tracking-[0.18em] ${verdictTone[row.verdict]}`}>
              {row.verdict}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

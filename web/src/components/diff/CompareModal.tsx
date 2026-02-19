import { useState } from 'react';
import { useRunStore } from '../../store/run-store';

type BundleFiles = {
  verdict: File | null;
  csv: File | null;
};

function FilePicker({
  title,
  files,
  onChange,
}: {
  title: string;
  files: BundleFiles;
  onChange: (next: BundleFiles) => void;
}) {
  return (
    <div className="rounded-lg border border-surface-600 p-3">
      <h4 className="mb-2 text-sm font-semibold text-zinc-300">{title}</h4>
      <div className="space-y-2">
        <input
          aria-label={`${title} verdict file`}
          type="file"
          accept=".json"
          onChange={(e) => onChange({ ...files, verdict: e.target.files?.[0] ?? null })}
          className="w-full rounded border border-surface-600 bg-surface-800 p-2 text-xs focus-visible:ring-2 focus-visible:ring-blue-500"
        />
        <input
          aria-label={`${title} stats file`}
          type="file"
          accept=".csv"
          onChange={(e) => onChange({ ...files, csv: e.target.files?.[0] ?? null })}
          className="w-full rounded border border-surface-600 bg-surface-800 p-2 text-xs focus-visible:ring-2 focus-visible:ring-blue-500"
        />
      </div>
    </div>
  );
}

export function CompareModal() {
  const open = useRunStore((s) => s.compareModalOpen);
  const setOpen = useRunStore((s) => s.setCompareModalOpen);
  const setComparisonRun = useRunStore((s) => s.setComparisonRun);
  const setPrimaryRun = useRunStore((s) => s.setPrimaryRun);

  const [baselineFiles, setBaselineFiles] = useState<BundleFiles>({ verdict: null, csv: null });
  const [currentFiles, setCurrentFiles] = useState<BundleFiles>({ verdict: null, csv: null });
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const runComparison = async () => {
    setError(null);
    if (!baselineFiles.verdict || !baselineFiles.csv || !currentFiles.verdict || !currentFiles.csv) {
      setError('Select verdict + stats files for both baseline and current runs.');
      return;
    }

    try {
      const { parseCsv, parseVerdict } = await import('../../lib/parsers');
      const baselineVerdict = parseVerdict(
        await baselineFiles.verdict.text(),
        baselineFiles.verdict.name
      );
      const baselineCsv = parseCsv(await baselineFiles.csv.text(), baselineFiles.csv.name);
      const currentVerdict = parseVerdict(await currentFiles.verdict.text(), currentFiles.verdict.name);
      const currentCsv = parseCsv(await currentFiles.csv.text(), currentFiles.csv.name);

      setComparisonRun({
        verdict: currentVerdict,
        csvRows: currentCsv,
        loadedAt: new Date().toISOString(),
        fileNames: { verdict: currentFiles.verdict.name, csv: currentFiles.csv.name },
      });

      setPrimaryRun({
        verdict: baselineVerdict,
        csvRows: baselineCsv,
        loadedAt: new Date().toISOString(),
        fileNames: { verdict: baselineFiles.verdict.name, csv: baselineFiles.csv.name },
      });

      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to compare selected files');
    }
  };

  const swapRuns = () => {
    setBaselineFiles(currentFiles);
    setCurrentFiles(baselineFiles);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Compare runs"
      onClick={() => setOpen(false)}
    >
      <div className="panel w-full max-w-3xl p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Compare Runs</h3>
          <button
            aria-label="Close compare modal"
            onClick={() => setOpen(false)}
            className="rounded border border-surface-600 px-2 py-1 text-sm focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FilePicker title="Baseline" files={baselineFiles} onChange={setBaselineFiles} />
          <FilePicker title="Current" files={currentFiles} onChange={setCurrentFiles} />
        </div>

        <div aria-live="polite">{error && <p className="mt-3 text-sm text-fail">{error}</p>}</div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={swapRuns}
            className="rounded border border-surface-600 px-3 py-1.5 text-sm hover:border-surface-500 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Swap
          </button>
          <button
            onClick={() => {
              setComparisonRun(null);
              setBaselineFiles({ verdict: null, csv: null });
              setCurrentFiles({ verdict: null, csv: null });
            }}
            className="rounded border border-surface-600 px-3 py-1.5 text-sm hover:border-surface-500 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Clear comparison
          </button>
          <button
            onClick={runComparison}
            className="rounded border border-pass/60 px-3 py-1.5 text-sm text-pass hover:border-pass focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Run comparison
          </button>
        </div>
      </div>
    </div>
  );
}

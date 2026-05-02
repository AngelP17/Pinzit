import { useEffect, useRef, useState } from 'react';
import { CaretDown, FilePlus, ShieldCheck, X } from '@phosphor-icons/react';
import { useRunStore } from '../../store/run-store';

type LoadedFile = File | null;

export function DropzonePanel() {
  const setPrimaryRun = useRunStore((s) => s.setPrimaryRun);
  const addToast = useRunStore((s) => s.addToast);
  const run = useRunStore((s) => s.primaryRun);

  const [verdictFile, setVerdictFile] = useState<LoadedFile>(null);
  const [csvFile, setCsvFile] = useState<LoadedFile>(null);
  const [open, setOpen] = useState(false);
  const [isOver, setIsOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onDocClick);
    return () => window.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const validateAndLoad = async (nextVerdict: LoadedFile, nextCsv: LoadedFile) => {
    if (!nextVerdict || !nextCsv) {
      addToast('Both files are required: pinzit_verdict.json and pinzit_stats.csv', 'info', 2800);
      return;
    }
    try {
      const { parseCsv, parseVerdict } = await import('../../lib/parsers');
      const verdict = parseVerdict(await nextVerdict.text(), nextVerdict.name);
      addToast(`Validated ${nextVerdict.name}`, 'success');
      const csvRows = parseCsv(await nextCsv.text(), nextCsv.name);
      addToast(`Validated ${nextCsv.name}`, 'success');
      setPrimaryRun({
        verdict,
        csvRows,
        loadedAt: new Date().toISOString(),
        fileNames: { verdict: nextVerdict.name, csv: nextCsv.name },
      });
      addToast('Run loaded', 'success');
      setOpen(false);
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to load files', 'error', 3800);
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    let nextVerdict = verdictFile;
    let nextCsv = csvFile;
    for (const file of Array.from(files)) {
      if (file.name.endsWith('.json')) nextVerdict = file;
      if (file.name.endsWith('.csv')) nextCsv = file;
    }
    setVerdictFile(nextVerdict);
    setCsvFile(nextCsv);
    await validateAndLoad(nextVerdict, nextCsv);
  };

  const loadSample = async (kind: 'pass' | 'fail') => {
    try {
      const mod = await import('../../lib/sample-data');
      const sample = kind === 'pass' ? mod.loadSamplePass() : mod.loadSampleFail();
      setPrimaryRun(sample);
      addToast(`Loaded sample ${kind.toUpperCase()} run`, 'info');
      setOpen(false);
    } catch (e) {
      addToast(e instanceof Error ? e.message : `Failed to load ${kind} sample`, 'error');
    }
  };

  const runSummary = run
    ? `${run.fileNames?.verdict ?? 'sample'} · ${run.csvRows.length} metric rows`
    : 'No run loaded';

  return (
    <section className="mb-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">ACTIVE RUN</span>
          <span className="text-[13px] text-ink-1">{runSummary}</span>
          {run ? (
            <span className="font-mono text-[11px] tracking-[0.18em] text-pass">PARSED</span>
          ) : (
            <span className="font-mono text-[11px] tracking-[0.18em] text-skip">WAITING</span>
          )}
        </div>

        <div className="relative" ref={popRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 text-[12px] text-ink-1 transition-colors hover:border-white/30 hover:text-white"
          >
            <FilePlus size={13} weight="bold" /> Load run
            <CaretDown size={11} weight="bold" />
          </button>

          {open ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[360px] surface p-4 shadow-panel">
              <input
                ref={inputRef}
                type="file"
                accept=".json,.csv"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (!e.target.files) return;
                  processFiles(e.target.files).catch(() => addToast('Failed to process files', 'error'));
                }}
              />
              <button
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
                onDragLeave={() => setIsOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsOver(false);
                  processFiles(e.dataTransfer.files).catch(() => addToast('Failed to process files', 'error'));
                }}
                className={`block w-full rounded-xl border border-dashed p-5 text-left transition-colors ${
                  isOver ? 'border-signal/60 bg-signal/5' : 'border-white/12 hover:border-white/30'
                }`}
              >
                <p className="text-[13px] text-white">Drop pinzit_verdict.json + pinzit_stats.csv</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-ink-2">
                  <ShieldCheck size={12} weight="bold" /> Parsed locally — never uploaded.
                </p>
              </button>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <FileChip label="verdict.json" loaded={Boolean(verdictFile)} onRemove={() => setVerdictFile(null)} />
                <FileChip label="stats.csv" loaded={Boolean(csvFile)} onRemove={() => setCsvFile(null)} />
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="font-mono text-[10px] tracking-[0.18em] text-ink-2">SAMPLES</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadSample('pass')}
                    className="rounded-full border border-pass/30 bg-pass/10 px-3 py-1 text-[11px] text-pass hover:bg-pass/20"
                  >
                    PASS
                  </button>
                  <button
                    onClick={() => loadSample('fail')}
                    className="rounded-full border border-fail/30 bg-fail/10 px-3 py-1 text-[11px] text-fail hover:bg-fail/20"
                  >
                    FAIL
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FileChip({ label, loaded, onRemove }: { label: string; loaded: boolean; onRemove?: () => void }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${
        loaded ? 'border-pass/40 text-pass' : 'border-white/10 text-ink-2'
      }`}
    >
      <span className={`block h-1.5 w-1.5 rounded-full ${loaded ? 'bg-pass' : 'bg-ink-2'}`} />
      {label}
      {loaded && onRemove ? (
        <button onClick={onRemove} aria-label={`Remove ${label}`} className="ml-0.5 hover:text-white">
          <X size={10} weight="bold" />
        </button>
      ) : null}
    </span>
  );
}

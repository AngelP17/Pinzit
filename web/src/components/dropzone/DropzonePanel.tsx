import { Upload, ShieldCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import { useRunStore } from '../../store/run-store';
import { CompatBadge } from './CompatBadge';
import { FileChip } from './FileChip';

type LoadedFile = File | null;

function metadata(file: File | null) {
  if (!file) return null;
  return {
    size: file.size,
    modifiedAt: new Date(file.lastModified).toLocaleString(),
  };
}

export function DropzonePanel() {
  const setPrimaryRun = useRunStore((s) => s.setPrimaryRun);
  const addToast = useRunStore((s) => s.addToast);

  const [verdictFile, setVerdictFile] = useState<LoadedFile>(null);
  const [csvFile, setCsvFile] = useState<LoadedFile>(null);
  const [isOver, setIsOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

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
      addToast('Run loaded successfully', 'success');
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

    if (nextVerdict) {
      try {
        const { parseVerdict } = await import('../../lib/parsers');
        parseVerdict(await nextVerdict.text(), nextVerdict.name);
      } catch (e) {
        addToast(e instanceof Error ? e.message : `Invalid file: ${nextVerdict.name}`, 'error', 3800);
      }
    }

    if (nextCsv) {
      try {
        const { parseCsv } = await import('../../lib/parsers');
        parseCsv(await nextCsv.text(), nextCsv.name);
      } catch (e) {
        addToast(e instanceof Error ? e.message : `Invalid file: ${nextCsv.name}`, 'error', 3800);
      }
    }

    await validateAndLoad(nextVerdict, nextCsv);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <section className="panel mb-4 p-4">
      <input
        ref={inputRef}
        type="file"
        accept=".json,.csv"
        multiple
        className="hidden"
        onChange={(e) => {
          if (!e.target.files) return;
          processFiles(e.target.files).catch(() => {
            addToast('Failed to process files', 'error');
          });
        }}
      />

      <button
        onClick={openPicker}
        onDragOver={(e) => {
          e.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsOver(false);
          processFiles(e.dataTransfer.files).catch(() => {
            addToast('Failed to process dropped files', 'error');
          });
        }}
        className={`group w-full rounded-2xl border-2 border-dashed p-6 text-center transition-all focus-visible:ring-2 focus-visible:ring-blue-500 ${
          isOver
            ? 'border-pass bg-gradient-to-r from-pass/15 via-pass/5 to-transparent'
            : 'border-surface-600 hover:border-pass/60 hover:bg-gradient-to-r hover:from-pass/10 hover:to-transparent'
        }`}
      >
        <Upload className="mx-auto mb-2 h-7 w-7 animate-pulse text-zinc-300 group-hover:text-pass" />
        <p className="text-lg font-semibold">Drop pinzit_verdict.json + pinzit_stats.csv</p>
        <p className="mt-1 inline-flex items-center gap-1 text-sm text-zinc-400" title="No data leaves your browser">
          <ShieldCheck size={14} /> All parsing happens in your browser.
        </p>
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FileChip
          label="verdict.json"
          loaded={Boolean(verdictFile)}
          fileMeta={metadata(verdictFile)}
          onRemove={() => setVerdictFile(null)}
        />
        <FileChip
          label="stats.csv"
          loaded={Boolean(csvFile)}
          fileMeta={metadata(csvFile)}
          onRemove={() => setCsvFile(null)}
        />
        <CompatBadge ok={Boolean(verdictFile && csvFile)} />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={async () => {
            try {
              const run = (await import('../../lib/sample-data')).loadSamplePass();
              setPrimaryRun(run);
              addToast('Loaded sample PASS run', 'info');
            } catch (e) {
              addToast(e instanceof Error ? e.message : 'Failed to load PASS sample', 'error');
            }
          }}
          className="rounded-lg border border-surface-600 px-3 py-1.5 text-sm hover:border-pass focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Load sample PASS
        </button>
        <button
          onClick={async () => {
            try {
              const run = (await import('../../lib/sample-data')).loadSampleFail();
              setPrimaryRun(run);
              addToast('Loaded sample FAIL run', 'info');
            } catch (e) {
              addToast(e instanceof Error ? e.message : 'Failed to load FAIL sample', 'error');
            }
          }}
          className="rounded-lg border border-surface-600 px-3 py-1.5 text-sm hover:border-fail focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Load sample FAIL
        </button>
      </div>
    </section>
  );
}

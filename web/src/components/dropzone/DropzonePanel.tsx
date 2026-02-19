import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRunStore } from '../../store/run-store';
import { CompatBadge } from './CompatBadge';
import { FileChip } from './FileChip';

export function DropzonePanel() {
  const setPrimaryRun = useRunStore((s) => s.setPrimaryRun);
  const [verdictFile, setVerdictFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (files: File[]) => {
      setError(null);
      let verdictCandidate = verdictFile;
      let csvCandidate = csvFile;

      for (const file of files) {
        if (file.name.endsWith('.json')) verdictCandidate = file;
        if (file.name.endsWith('.csv')) csvCandidate = file;
      }

      setVerdictFile(verdictCandidate);
      setCsvFile(csvCandidate);

      if (!verdictCandidate || !csvCandidate) return;

      try {
        const { parseCsv, parseVerdict } = await import('../../lib/parsers');
        const verdict = parseVerdict(await verdictCandidate.text(), verdictCandidate.name);
        const csvRows = parseCsv(await csvCandidate.text(), csvCandidate.name);
        setPrimaryRun({
          verdict,
          csvRows,
          loadedAt: new Date().toISOString(),
          fileNames: { verdict: verdictCandidate.name, csv: csvCandidate.name },
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load files');
      }
    },
    [csvFile, setPrimaryRun, verdictFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv'],
    },
  });

  return (
    <section className="panel mb-4 p-4">
      <div {...getRootProps()} className={`cursor-pointer rounded-xl border border-dashed p-6 text-center transition-colors focus-within:ring-2 focus-within:ring-blue-500 ${isDragActive ? 'border-pass bg-pass/5' : 'border-surface-600 hover:border-surface-500'}`}>
        <input {...getInputProps()} />
        <p className="text-lg font-semibold">Drop pinzit_verdict.json + pinzit_stats.csv</p>
        <p className="mt-1 text-sm text-zinc-400">No upload. All parsing happens in your browser.</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FileChip label="verdict.json" loaded={Boolean(verdictFile)} />
        <FileChip label="stats.csv" loaded={Boolean(csvFile)} />
        <CompatBadge ok={Boolean(verdictFile && csvFile)} />
      </div>
      <div aria-live="polite">{error && <p className="mt-2 text-sm text-fail">{error}</p>}</div>
      <div className="mt-3 flex gap-2">
        <button onClick={async () => setPrimaryRun((await import('../../lib/sample-data')).loadSamplePass())} className="rounded-md border border-surface-600 px-3 py-1.5 text-sm hover:border-pass focus-visible:ring-2 focus-visible:ring-blue-500">Load sample PASS</button>
        <button onClick={async () => setPrimaryRun((await import('../../lib/sample-data')).loadSampleFail())} className="rounded-md border border-surface-600 px-3 py-1.5 text-sm hover:border-fail focus-visible:ring-2 focus-visible:ring-blue-500">Load sample FAIL</button>
      </div>
    </section>
  );
}

import { Download, GitCompare, Search } from 'lucide-react';
import { useRunStore } from '../../store/run-store';
import { exportCSV, exportJSON } from '../../lib/export';

export function Header() {
  const run = useRunStore((s) => s.primaryRun);
  const setPaletteOpen = useRunStore((s) => s.setPaletteOpen);
  const setCompareModalOpen = useRunStore((s) => s.setCompareModalOpen);
  const setViewMode = useRunStore((s) => s.setViewMode);

  return (
    <header className="panel mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pinzit Control Room</h1>
        <p className="text-sm text-zinc-400">Client-only reliability audit dashboard</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setViewMode('audit')} className="rounded-md border border-surface-600 px-3 py-1.5 text-sm hover:border-pass/70 focus-visible:ring-2 focus-visible:ring-blue-500">Audit</button>
        <button onClick={() => setViewMode('explore')} className="rounded-md border border-surface-600 px-3 py-1.5 text-sm hover:border-pass/70 focus-visible:ring-2 focus-visible:ring-blue-500">Explore</button>
        <button onClick={() => setViewMode('focus')} className="rounded-md border border-surface-600 px-3 py-1.5 text-sm hover:border-pass/70 focus-visible:ring-2 focus-visible:ring-blue-500">Focus</button>
        <button aria-label="Open command palette" onClick={() => setPaletteOpen(true)} className="inline-flex items-center gap-1 rounded-md border border-surface-600 px-3 py-1.5 text-sm hover:border-surface-500 focus-visible:ring-2 focus-visible:ring-blue-500"><Search size={14} /> Cmd+K</button>
        <button aria-label="Open compare run modal" onClick={() => setCompareModalOpen(true)} className="inline-flex items-center gap-1 rounded-md border border-surface-600 px-3 py-1.5 text-sm hover:border-surface-500 focus-visible:ring-2 focus-visible:ring-blue-500"><GitCompare size={14} /> Compare Run</button>
        <button aria-label="Export verdict JSON" disabled={!run} onClick={() => run && exportJSON(run.verdict)} className="inline-flex items-center gap-1 rounded-md border border-surface-600 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-surface-500 focus-visible:ring-2 focus-visible:ring-blue-500"><Download size={14} /> JSON</button>
        <button aria-label="Export stats CSV" disabled={!run} onClick={() => run && exportCSV(run.csvRows)} className="inline-flex items-center gap-1 rounded-md border border-surface-600 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-surface-500 focus-visible:ring-2 focus-visible:ring-blue-500"><Download size={14} /> CSV</button>
      </div>
    </header>
  );
}

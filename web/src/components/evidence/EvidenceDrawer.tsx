import { X } from 'lucide-react';
import { useRunStore } from '../../store/run-store';
import type { RunBundle } from '../../types/pinzit';
import { DecisionTrace } from './DecisionTrace';
import { EvidenceSpanList } from './EvidenceSpanList';
import { MetricsTable } from './MetricsTable';

export function EvidenceDrawer({ run }: { run: RunBundle | null }) {
  const drawerOpen = useRunStore((s) => s.drawerOpen);
  const target = useRunStore((s) => s.evidenceTarget);
  const close = useRunStore((s) => s.closeEvidence);

  const result = run && target ? run.verdict.constraints[target] : null;

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="Evidence drawer"
      className={`fixed right-0 top-0 z-40 h-full w-full max-w-xl transform border-l border-surface-600 bg-surface-900 p-4 shadow-panel transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Evidence {target ? `• ${target}` : ''}</h3>
        <button aria-label="Close evidence drawer" onClick={close} className="rounded-md border border-surface-600 p-1 focus-visible:ring-2 focus-visible:ring-blue-500"><X size={14} /></button>
      </div>
      {!result ? (
        <p className="mt-4 text-sm text-zinc-400">Select a finding to inspect its decision inputs.</p>
      ) : (
        <div className="mt-4 space-y-4">
          <DecisionTrace result={result} />
          <MetricsTable metrics={result.metrics as Record<string, unknown>} />
          <EvidenceSpanList spans={result.evidence_spans} />
        </div>
      )}
    </aside>
  );
}

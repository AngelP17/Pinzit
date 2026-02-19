import type { RunBundle } from '../../types/pinzit';
import { EmptyState } from '../shared/EmptyState';

export function EvidenceTab({ run }: { run: RunBundle | null }) {
  if (!run) {
    return <EmptyState title="No evidence loaded" subtitle="Select a row from Findings or a scorecard from Overview." />;
  }

  return (
    <div className="panel p-4">
      <h3 className="text-lg font-semibold">Evidence workspace</h3>
      <p className="mt-2 text-sm text-zinc-400">Use scorecards or findings rows to open the drawer with decision trace, metrics, and spans.</p>
    </div>
  );
}

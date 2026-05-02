import type { RunBundle } from '../../types/pinzit';
import { TraceTimeline, FailureOriginPanel, RecoveryTimeRuler, CriticalPathPanel, SpanInspector } from './TimelineSuite';

export function TimelineTab({ run }: { run: RunBundle | null }) {
  if (!run) {
    return (
      <div className="panel flex min-h-56 flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-zinc-400">Load a run to view the incident timeline and critical path.</p>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--density-gap)]">
      <div className="tab-header">
        <div>
          <h2 className="tab-title">Timeline</h2>
          <p className="tab-subtitle">Incident reconstruction, failure origin, recovery ruler, and critical path.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <TraceTimeline run={run} />
          <CriticalPathPanel run={run} />
        </div>
        <div className="space-y-4">
          <FailureOriginPanel run={run} />
          <RecoveryTimeRuler run={run} />
          <SpanInspector run={run} />
        </div>
      </div>
    </div>
  );
}

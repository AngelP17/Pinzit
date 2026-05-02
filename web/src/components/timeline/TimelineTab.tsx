import type { RunBundle } from '../../types/pinzit';
import { EmptyState } from '../shared/EmptyState';
import {
  CriticalPathPanel,
  FailureOriginPanel,
  RecoveryTimeRuler,
  SpanInspector,
  TraceTimeline,
} from './TimelineSuite';

export function TimelineTab({ run }: { run: RunBundle | null }) {
  if (!run) {
    return <EmptyState title="No timeline yet" subtitle="Load a run to reconstruct incident order, recovery, and critical path." />;
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">TIMELINE</span>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
            Incident reconstruction & recovery envelope
          </h2>
          <p className="mt-1 text-sm text-ink-1">
            Origin, propagation, containment and recovery — rebuilt from the parsed trace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 space-y-5 lg:col-span-8">
          <TraceTimeline run={run} />
          <CriticalPathPanel run={run} />
        </div>
        <div className="col-span-12 space-y-5 lg:col-span-4">
          <FailureOriginPanel run={run} />
          <RecoveryTimeRuler run={run} />
          <SpanInspector run={run} />
        </div>
      </div>
    </div>
  );
}

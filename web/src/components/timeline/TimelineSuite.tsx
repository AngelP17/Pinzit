import type { RunBundle } from '../../types/pinzit';
import { Clock, Lightbulb, Target, ShieldWarning } from '@phosphor-icons/react';

function TimelineItem({
  time,
  label,
  detail,
  severity,
}: {
  time: string;
  label: string;
  detail: string;
  severity: 'info' | 'warn' | 'critical';
}) {
  const color =
    severity === 'critical' ? 'border-fail text-fail' : severity === 'warn' ? 'border-skip text-skip' : 'border-pass text-pass';
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full border-2 ${color}`} />
        <div className="w-px flex-1 bg-surface-600" />
      </div>
      <div className="pb-6">
        <p className="text-xs font-mono text-zinc-500">{time}</p>
        <p className="mt-0.5 text-sm font-semibold text-white">{label}</p>
        <p className="mt-0.5 text-xs text-zinc-400">{detail}</p>
      </div>
    </div>
  );
}

export function TraceTimeline({ run }: { run: RunBundle | null }) {
  if (!run) return null;

  const slfs = run.verdict.constraints.slfs_001;
  const rtcb = run.verdict.constraints.rtcb_002;
  const brc = run.verdict.constraints.brc_003;

  const events: { time: string; label: string; detail: string; severity: 'info' | 'warn' | 'critical' }[] = [];

  if (slfs.metrics.signal_loss_events && slfs.metrics.signal_loss_events > 0) {
    events.push({
      time: 'T+0',
      label: 'Signal Loss Detected',
      detail: `${slfs.metrics.signal_loss_events} event(s) observed`,
      severity: 'warn',
    });
  }

  if (brc.metrics.fault_root_count && brc.metrics.fault_root_count > 0) {
    events.push({
      time: 'T+1',
      label: 'Fault Root Identified',
      detail: `${brc.metrics.fault_root_count} root fault(s)`,
      severity: 'critical',
    });
  }

  if (slfs.metrics.unsafe_after_loss_count && slfs.metrics.unsafe_after_loss_count > 0) {
    events.push({
      time: 'T+2',
      label: 'Unsafe Action After Loss',
      detail: `${slfs.metrics.unsafe_after_loss_count} unsafe operation(s)`,
      severity: 'critical',
    });
  }

  if (rtcb.metrics.max_recovery_ms_seen && rtcb.metrics.max_recovery_ms_seen > 0) {
    const seen = Number(rtcb.metrics.max_recovery_ms_seen);
    const threshold = Number(rtcb.metrics.max_recovery_ms);
    events.push({
      time: 'T+3',
      label: 'Recovery Attempt',
      detail: `Observed ${seen}ms (threshold ${threshold}ms)`,
      severity: seen > threshold ? 'critical' : 'info',
    });
  }

  if (brc.metrics.containment_latency_ms && brc.metrics.containment_latency_ms > 0) {
    events.push({
      time: 'T+4',
      label: 'Containment Boundary',
      detail: `Latency ${brc.metrics.containment_latency_ms}ms`,
      severity: 'info',
    });
  }

  if (events.length === 0) {
    events.push({
      time: '—',
      label: 'No significant events',
      detail: 'All constraints passed without notable timeline events.',
      severity: 'info',
    });
  }

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock size={18} weight="duotone" className="text-[#00f0ff]" />
        <h3 className="text-sm font-semibold text-white">Incident Timeline</h3>
      </div>
      <div className="max-h-96 overflow-auto pr-2">
        {events.map((e, i) => (
          <TimelineItem key={i} {...e} />
        ))}
      </div>
    </div>
  );
}

export function FailureOriginPanel({ run }: { run: RunBundle | null }) {
  if (!run) return null;

  const origin = (() => {
    const slfs = run.verdict.constraints.slfs_001;
    if (slfs.verdict === 'FAIL' && slfs.metrics.unsafe_after_loss_count && slfs.metrics.unsafe_after_loss_count > 0) {
      return {
        constraintId: 'slfs_001' as const,
        reason: 'Unsafe action occurred before safe state confirmation',
        severity: 'critical' as const,
      };
    }
    const brc = run.verdict.constraints.brc_003;
    if (brc.verdict === 'FAIL' && brc.metrics.max_hops_seen && brc.metrics.max_hops_seen > brc.metrics.max_propagation_hops) {
      return {
        constraintId: 'brc_003' as const,
        reason: 'Failure propagated beyond isolation boundary',
        severity: 'critical' as const,
      };
    }
    const rtcb = run.verdict.constraints.rtcb_002;
    if (rtcb.verdict === 'FAIL' && rtcb.metrics.max_recovery_ms_seen && rtcb.metrics.max_recovery_ms_seen > rtcb.metrics.max_recovery_ms) {
      return {
        constraintId: 'rtcb_002' as const,
        reason: 'Recovery exceeded configured bound',
        severity: 'critical' as const,
      };
    }
    return null;
  })();

  if (!origin) {
    return (
      <div className="panel p-5">
        <div className="flex items-center gap-2">
          <ShieldWarning size={18} weight="duotone" className="text-pass" />
          <h3 className="text-sm font-semibold text-white">Failure Origin</h3>
        </div>
        <p className="mt-2 text-sm text-zinc-400">No failure origin detected. All constraints satisfied.</p>
      </div>
    );
  }

  return (
    <div className="panel border-l-4 border-l-fail p-5">
      <div className="flex items-center gap-2">
        <Target size={18} weight="duotone" className="text-fail" />
        <h3 className="text-sm font-semibold text-white">Failure Origin</h3>
      </div>
      <p className="mt-2 text-sm text-zinc-300">
        <span className="font-mono text-white">{origin.constraintId}</span> failed first.
      </p>
      <p className="mt-1 text-sm text-zinc-400">{origin.reason}</p>
    </div>
  );
}

export function RecoveryTimeRuler({ run }: { run: RunBundle | null }) {
  if (!run) return null;
  const rtcb = run.verdict.constraints.rtcb_002;
  const threshold = Number(rtcb.metrics.max_recovery_ms);
  const observed = Number(rtcb.metrics.max_recovery_ms_seen ?? 0);
  const pct = threshold > 0 ? Math.min((observed / threshold) * 100, 100) : 0;

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock size={18} weight="duotone" className="text-[#00f0ff]" />
        <h3 className="text-sm font-semibold text-white">Recovery Time Ruler</h3>
      </div>
      <div className="relative h-3 w-full rounded-full bg-surface-700">
        <div
          className={`absolute left-0 top-0 h-3 rounded-full transition-all ${observed > threshold ? 'bg-fail' : 'bg-pass'}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 h-3 w-0.5 -translate-x-1/2 bg-white"
          style={{ left: '100%' }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-zinc-400">
        <span>0ms</span>
        <span className="font-mono text-white">Observed: {observed}ms</span>
        <span className="font-mono">Threshold: {threshold}ms</span>
      </div>
      {observed > threshold && (
        <p className="mt-2 text-xs text-fail">Recovery exceeded threshold by {observed - threshold}ms</p>
      )}
    </div>
  );
}

export function CriticalPathPanel({ run }: { run: RunBundle | null }) {
  if (!run) return null;
  const slfs = run.verdict.constraints.slfs_001;
  const brc = run.verdict.constraints.brc_003;
  const rtcb = run.verdict.constraints.rtcb_002;

  const steps = [
    {
      label: 'Signal Loss',
      value: String(slfs.metrics.signal_loss_events ?? 0),
      verdict: slfs.verdict,
    },
    {
      label: 'Fault Propagation',
      value: `${brc.metrics.max_hops_seen ?? 0} hops`,
      verdict: brc.verdict,
    },
    {
      label: 'Containment',
      value: `${brc.metrics.containment_latency_ms ?? 0}ms`,
      verdict: brc.verdict,
    },
    {
      label: 'Recovery',
      value: `${rtcb.metrics.max_recovery_ms_seen ?? 0}ms`,
      verdict: rtcb.verdict,
    },
  ];

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb size={18} weight="duotone" className="text-[#00f0ff]" />
        <h3 className="text-sm font-semibold text-white">Critical Path</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {steps.map((s) => (
          <div
            key={s.label}
            className={`rounded-lg border p-3 ${s.verdict === 'FAIL' ? 'border-fail/50 bg-fail/10' : 'border-surface-600 bg-surface-800/50'}`}
          >
            <p className="text-xs text-zinc-400">{s.label}</p>
            <p className="mt-1 font-mono text-sm text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SpanInspector({ run }: { run: RunBundle | null }) {
  if (!run) return null;
  const spans = [
    ...run.verdict.constraints.slfs_001.evidence_spans,
    ...run.verdict.constraints.rtcb_002.evidence_spans,
    ...run.verdict.constraints.brc_003.evidence_spans,
  ];

  return (
    <div className="panel p-5">
      <h3 className="text-sm font-semibold text-white">Evidence Spans</h3>
      <ul className="mt-3 space-y-2">
        {spans.map((span, i) => (
          <li key={`${span}-${i}`} className="flex items-center gap-2 text-xs text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff]" />
            <span className="font-mono">{span}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

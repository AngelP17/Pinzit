import type { RunBundle } from '../../types/pinzit';

type Severity = 'info' | 'warn' | 'critical';

function tone(sev: Severity) {
  if (sev === 'critical') return 'bg-fail';
  if (sev === 'warn') return 'bg-skip';
  return 'bg-pass';
}

function TimelineItem({
  time,
  label,
  detail,
  severity,
}: {
  time: string;
  label: string;
  detail: string;
  severity: Severity;
}) {
  return (
    <li className="grid grid-cols-12 gap-4 border-b border-white/5 py-4 last:border-b-0">
      <div className="col-span-2 flex items-start gap-3">
        <span className={`mt-1.5 block h-2 w-2 rounded-full ${tone(severity)}`} />
        <span className="font-mono text-[11px] tracking-[0.18em] text-ink-2">{time}</span>
      </div>
      <div className="col-span-10">
        <p className="text-[14px] font-medium text-white tracking-tight">{label}</p>
        <p className="mt-1 text-[12.5px] text-ink-1">{detail}</p>
      </div>
    </li>
  );
}

export function TraceTimeline({ run }: { run: RunBundle | null }) {
  if (!run) return null;

  const slfs = run.verdict.constraints.slfs_001;
  const rtcb = run.verdict.constraints.rtcb_002;
  const brc = run.verdict.constraints.brc_003;

  const events: { time: string; label: string; detail: string; severity: Severity }[] = [];

  if (slfs.metrics.signal_loss_events && slfs.metrics.signal_loss_events > 0) {
    events.push({ time: 'T+0', label: 'Signal Loss Detected', detail: `${slfs.metrics.signal_loss_events} event(s) observed`, severity: 'warn' });
  }
  if (brc.metrics.fault_root_count && brc.metrics.fault_root_count > 0) {
    events.push({ time: 'T+1', label: 'Fault Root Identified', detail: `${brc.metrics.fault_root_count} root fault(s)`, severity: 'critical' });
  }
  if (slfs.metrics.unsafe_after_loss_count && slfs.metrics.unsafe_after_loss_count > 0) {
    events.push({ time: 'T+2', label: 'Unsafe Action After Loss', detail: `${slfs.metrics.unsafe_after_loss_count} unsafe operation(s)`, severity: 'critical' });
  }
  if (rtcb.metrics.max_recovery_ms_seen && rtcb.metrics.max_recovery_ms_seen > 0) {
    const seen = Number(rtcb.metrics.max_recovery_ms_seen);
    const threshold = Number(rtcb.metrics.max_recovery_ms);
    events.push({ time: 'T+3', label: 'Recovery Attempt', detail: `Observed ${seen}ms · ceiling ${threshold}ms`, severity: seen > threshold ? 'critical' : 'info' });
  }
  if (brc.metrics.containment_latency_ms && brc.metrics.containment_latency_ms > 0) {
    events.push({ time: 'T+4', label: 'Containment Boundary', detail: `Latency ${brc.metrics.containment_latency_ms}ms · within bound`, severity: 'info' });
  }

  if (events.length === 0) {
    events.push({ time: '—', label: 'No significant events', detail: 'All constraints passed without notable timeline events.', severity: 'info' });
  }

  return (
    <section className="surface p-6">
      <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
        <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">INCIDENT TIMELINE</span>
        <span className="font-mono text-[11px] text-ink-2">{events.length} event{events.length === 1 ? '' : 's'}</span>
      </div>
      <ul className="mt-2">
        {events.map((e, i) => <TimelineItem key={i} {...e} />)}
      </ul>
    </section>
  );
}

export function FailureOriginPanel({ run }: { run: RunBundle | null }) {
  if (!run) return null;

  const slfs = run.verdict.constraints.slfs_001;
  const rtcb = run.verdict.constraints.rtcb_002;
  const brc = run.verdict.constraints.brc_003;

  const origin = (() => {
    if (slfs.verdict === 'FAIL' && slfs.metrics.unsafe_after_loss_count && slfs.metrics.unsafe_after_loss_count > 0) {
      return { id: 'slfs_001', reason: 'Unsafe action occurred before safe state confirmation' };
    }
    if (brc.verdict === 'FAIL' && brc.metrics.max_hops_seen && brc.metrics.max_hops_seen > brc.metrics.max_propagation_hops) {
      return { id: 'brc_003', reason: 'Failure propagated beyond isolation boundary' };
    }
    if (rtcb.verdict === 'FAIL' && rtcb.metrics.max_recovery_ms_seen && rtcb.metrics.max_recovery_ms_seen > rtcb.metrics.max_recovery_ms) {
      return { id: 'rtcb_002', reason: 'Recovery exceeded configured bound' };
    }
    return null;
  })();

  return (
    <section className="surface p-6">
      <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
        <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">FAILURE ORIGIN</span>
        {origin
          ? <span className="font-mono text-[11px] text-fail">DETECTED</span>
          : <span className="font-mono text-[11px] text-pass">NONE</span>}
      </div>
      {origin
        ? (
          <div className="mt-4">
            <p className="font-mono text-[13px] text-fail">{origin.id}</p>
            <p className="mt-1.5 text-[14px] text-ink-1">{origin.reason}</p>
          </div>
        )
        : <p className="mt-4 text-[14px] text-ink-1">No failure origin detected. All constraints satisfied.</p>}
    </section>
  );
}

export function RecoveryTimeRuler({ run }: { run: RunBundle | null }) {
  if (!run) return null;
  const rtcb = run.verdict.constraints.rtcb_002;
  const threshold = Number(rtcb.metrics.max_recovery_ms);
  const observed = Number(rtcb.metrics.max_recovery_ms_seen ?? 0);
  const pct = threshold > 0 ? Math.min((observed / threshold) * 100, 100) : 0;
  const over = observed > threshold;

  return (
    <section className="surface p-6">
      <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
        <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">RECOVERY RULER</span>
        <span className={`font-mono text-[11px] ${over ? 'text-fail' : 'text-pass'}`}>
          {over ? 'OVER' : 'WITHIN'}
        </span>
      </div>
      <div className="mt-5">
        <div className="relative h-1.5 w-full rounded-full bg-white/10">
          <div
            className={`absolute left-0 top-0 h-full rounded-full ${over ? 'bg-fail' : 'bg-pass'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between font-mono text-[11px] text-ink-2">
          <span>0ms</span>
          <span className="text-white">observed {observed}ms</span>
          <span>ceiling {threshold}ms</span>
        </div>
        {over ? (
          <p className="mt-3 text-[12.5px] text-fail">
            Recovery exceeded ceiling by {observed - threshold}ms.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function CriticalPathPanel({ run }: { run: RunBundle | null }) {
  if (!run) return null;
  const slfs = run.verdict.constraints.slfs_001;
  const brc = run.verdict.constraints.brc_003;
  const rtcb = run.verdict.constraints.rtcb_002;

  const steps = [
    { label: 'Signal Loss',      value: String(slfs.metrics.signal_loss_events ?? 0), verdict: slfs.verdict },
    { label: 'Fault Propagation', value: `${brc.metrics.max_hops_seen ?? 0} hops`,    verdict: brc.verdict  },
    { label: 'Containment',       value: `${brc.metrics.containment_latency_ms ?? 0}ms`, verdict: brc.verdict },
    { label: 'Recovery',          value: `${rtcb.metrics.max_recovery_ms_seen ?? 0}ms`, verdict: rtcb.verdict },
  ];

  return (
    <section className="surface p-6">
      <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
        <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">CRITICAL PATH</span>
        <span className="font-mono text-[11px] text-ink-2">{steps.length} segments</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-px bg-white/5 md:grid-cols-4">
        {steps.map((s) => {
          const tone = s.verdict === 'FAIL' ? 'text-fail' : s.verdict === 'PASS' ? 'text-white' : 'text-skip';
          return (
            <div key={s.label} className="bg-paper-1 px-4 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-2">{s.label}</p>
              <p className={`mt-1 font-mono text-[13px] ${tone}`}>{s.value}</p>
            </div>
          );
        })}
      </div>
    </section>
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
    <section className="surface p-6">
      <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
        <span className="font-mono text-[11px] tracking-[0.22em] text-ink-2">EVIDENCE SPANS</span>
        <span className="font-mono text-[11px] text-ink-2">{spans.length}</span>
      </div>
      <ul className="mt-3 space-y-2">
        {spans.map((span, i) => (
          <li key={`${span}-${i}`} className="flex items-center gap-2.5 font-mono text-[12.5px] text-ink-1">
            <span className="block h-1.5 w-1.5 rounded-full bg-signal" />
            <span className="break-all">{span}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

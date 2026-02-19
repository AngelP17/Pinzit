import type { CsvMetricRow, RunBundle, Verdict } from '../types/pinzit';

type Mode = 'pass' | 'fail' | 'mixed';

export type PreviewPacket = {
  runId: string;
  environment: string;
  profile: string;
  timestamp: string;
  latencyMs: number;
  spanCount: number;
  signalLossEvents: number;
  evidenceCount: number;
  verdict: Verdict['overall_verdict'];
  lines: string[];
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nowIso(): string {
  return new Date().toISOString();
}

function shortId(): string {
  return Math.random().toString(16).slice(2, 8);
}

function pick<T>(values: readonly T[]): T {
  return values[randInt(0, values.length - 1)];
}

function buildVerdict(mode: Mode): Verdict {
  const runId = `run_${nowIso()}_${shortId()}`.replace(/[:.]/g, '-');

  const slfsSignalEvents = mode === 'fail' ? randInt(2, 6) : randInt(0, 2);
  const slfsUnsafeAfterLoss = mode === 'pass' ? 0 : mode === 'mixed' ? randInt(0, 1) : randInt(2, 5);
  const slfsSafeHits =
    slfsUnsafeAfterLoss > 0 ? randInt(0, Math.max(0, slfsSignalEvents - 1)) : slfsSignalEvents;

  const rtcbSeen =
    mode === 'fail' ? randInt(31000, 58000) : mode === 'mixed' ? randInt(15000, 36000) : randInt(650, 2600);
  const rtcbOverLimit = rtcbSeen > 30000 ? 1 : 0;
  const rtcbPass = mode === 'pass' ? true : rtcbOverLimit === 0;

  const brcHops =
    mode === 'fail' ? randInt(3, 6) : mode === 'mixed' ? randInt(2, 3) : randInt(0, 2);
  const brcLatency =
    mode === 'fail' ? randInt(2400, 6400) : mode === 'mixed' ? randInt(900, 2800) : randInt(140, 880);
  const brcPass = mode === 'pass' ? true : mode === 'mixed' ? brcHops <= 2 : false;

  const constraints: Verdict['constraints'] = {
    slfs_001: {
      verdict: slfsUnsafeAfterLoss > 0 ? 'FAIL' : 'PASS',
      metrics: {
        signal_loss_timeout_ms: 500,
        safe_state_deadline_ms: 250,
        signal_loss_events: slfsSignalEvents,
        safe_state_hits: slfsSafeHits,
        unsafe_after_loss_count: slfsUnsafeAfterLoss,
        unsafe_action_pattern_count: 5,
        safe_state_pattern_count: 5,
      },
      evidence_spans:
        slfsUnsafeAfterLoss > 0
          ? ['trace.span.telemetry.drop', 'trace.span.motion.actuate', 'trace.span.commit.write']
          : ['trace.span.signal_loss_watchdog'],
      recommendations:
        slfsUnsafeAfterLoss > 0
          ? ['Block unsafe operations when telemetry age exceeds threshold.']
          : [],
    },
    rtcb_002: {
      verdict: rtcbPass ? 'PASS' : 'FAIL',
      metrics: {
        max_recovery_ms: 30000,
        recovery_span_matches: randInt(1, 3),
        max_recovery_ms_seen: rtcbSeen,
        over_limit_count: rtcbOverLimit,
        stability_check: true,
        stability_satisfied: rtcbPass,
        recovery_span_name: 'system.recovery',
        recovery_attribute: 'recovery.complete',
      },
      evidence_spans: ['trace.span.system.recovery', 'trace.span.recovery.validation'],
      recommendations: rtcbPass ? [] : ['Cap retry backoff and bound readiness checks.'],
    },
    brc_003: {
      verdict: brcPass ? 'PASS' : 'FAIL',
      metrics: {
        max_propagation_hops: 2,
        max_hops_seen: brcHops,
        containment_timeout_ms: 2000,
        containment_latency_ms: brcLatency,
        fault_root_count: mode === 'fail' ? randInt(1, 3) : randInt(0, 1),
        boundary_detected: true,
        isolation_boundary_attribute: 'fault.isolation',
      },
      evidence_spans: brcPass
        ? ['trace.span.fault.isolation']
        : ['trace.span.fault.injector', 'trace.span.api.gateway', 'trace.span.queue.fanout'],
      recommendations: brcPass ? [] : ['Introduce bulkheads and fan-out limits.'],
    },
  };

  const overallFail =
    constraints.slfs_001.verdict === 'FAIL' ||
    constraints.rtcb_002.verdict === 'FAIL' ||
    constraints.brc_003.verdict === 'FAIL';

  return {
    overall_verdict: overallFail ? 'FAIL' : 'PASS',
    metadata: {
      run_id: runId,
      generated_at: nowIso(),
    },
    constraints,
  };
}

function buildCsv(verdict: Verdict): CsvMetricRow[] {
  const spans =
    verdict.overall_verdict === 'PASS'
      ? randInt(180, 420)
      : randInt(90, 260);
  const markers = verdict.overall_verdict === 'PASS' ? randInt(4, 11) : randInt(2, 7);

  return [
    { metric: 'resource_span_markers', value: String(markers) },
    { metric: 'parsed_span_count', value: String(spans) },
    { metric: 'overall_verdict', value: verdict.overall_verdict },
  ];
}

export function createMockBundle(mode: Mode): RunBundle {
  const verdict = buildVerdict(mode);
  const createdAt = nowIso();
  return {
    verdict,
    csvRows: buildCsv(verdict),
    loadedAt: createdAt,
    fileNames: {
      verdict: `pinzit_verdict_${createdAt.slice(0, 19).replace(/[:T]/g, '-')}.json`,
      csv: `pinzit_stats_${createdAt.slice(0, 19).replace(/[:T]/g, '-')}.csv`,
    },
  };
}

export function createPreviewPackets(): PreviewPacket[] {
  const runs = [
    { run: createMockBundle('pass'), mode: 'pass' as const },
    { run: createMockBundle('mixed'), mode: 'mixed' as const },
    { run: createMockBundle('fail'), mode: 'fail' as const },
    { run: createMockBundle('pass'), mode: 'pass' as const },
  ];

  const profiles = {
    pass: ['nightly-baseline', 'prod-canary', 'soak-test'],
    mixed: ['staging-replay', 'release-candidate'],
    fail: ['incident-replay', 'chaos-window'],
  } as const;

  const environments = ['prod-us-east-1', 'prod-eu-west-1', 'staging-us-central-1'] as const;

  return runs.map(({ run, mode }) => {
    const slfs = run.verdict.constraints.slfs_001;
    const rtcb = run.verdict.constraints.rtcb_002;
    const brc = run.verdict.constraints.brc_003;
    const spanCount = Number(run.csvRows.find((row) => row.metric === 'parsed_span_count')?.value ?? '0');
    const signalLossEvents = Number(slfs.metrics.signal_loss_events ?? 0);
    const evidenceCount =
      slfs.evidence_spans.length + rtcb.evidence_spans.length + brc.evidence_spans.length;
    const latencyMs = Number(
      brc.metrics.containment_latency_ms ?? rtcb.metrics.max_recovery_ms_seen ?? 0
    );

    return {
      runId: run.verdict.metadata?.run_id ?? 'run_unknown',
      environment: pick(environments),
      profile: pick(profiles[mode]),
      timestamp: run.loadedAt.replace('T', ' ').replace('Z', ' UTC'),
      latencyMs,
      spanCount,
      signalLossEvents,
      evidenceCount,
      verdict: run.verdict.overall_verdict,
      lines: [
        `meta.audit_scope=prod reliability_gate=v2.3`,
        `stats.resource_span_markers=${run.csvRows.find((r) => r.metric === 'resource_span_markers')?.value ?? '0'} parsed_span_count=${spanCount}`,
        `slfs_001=${slfs.verdict} unsafe_after_loss_count=${slfs.metrics.unsafe_after_loss_count}`,
        `rtcb_002=${rtcb.verdict} max_recovery_ms_seen=${rtcb.metrics.max_recovery_ms_seen}`,
        `brc_003=${brc.verdict} containment_latency_ms=${brc.metrics.containment_latency_ms} max_hops_seen=${brc.metrics.max_hops_seen}`,
      ],
    };
  });
}

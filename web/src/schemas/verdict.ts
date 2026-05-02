import { z } from 'zod';

const slfsMetricsSchema = z.object({
  signal_loss_timeout_ms: z.number(),
  safe_state_deadline_ms: z.number(),
  signal_loss_events: z.number().optional(),
  safe_state_hits: z.number().optional(),
  unsafe_after_loss_count: z.number().optional(),
  unsafe_action_pattern_count: z.number().optional(),
  safe_state_pattern_count: z.number().optional(),
}).strict();

const rtcbMetricsSchema = z.object({
  max_recovery_ms: z.number(),
  recovery_span_matches: z.number().optional(),
  max_recovery_ms_seen: z.number().optional(),
  over_limit_count: z.number().optional(),
  stability_check: z.boolean().optional(),
  stability_satisfied: z.boolean().optional(),
  recovery_span_name: z.string(),
  recovery_attribute: z.string(),
}).strict();

const brcMetricsSchema = z.object({
  max_propagation_hops: z.number(),
  max_hops_seen: z.number().optional(),
  containment_timeout_ms: z.number(),
  containment_latency_ms: z.number().optional(),
  fault_root_count: z.number().optional(),
  boundary_detected: z.boolean().optional(),
  isolation_boundary_attribute: z.string(),
}).strict();

const verdictEnum = z.enum(['PASS', 'FAIL', 'SKIPPED']);

const constraintResultBaseSchema = z.object({
  verdict: verdictEnum,
  evidence_spans: z.array(z.string()),
  recommendations: z.array(z.string()),
}).strict();

const metadataSchema = z
  .object({
    run_id: z.string().min(1).optional(),
    generated_at: z.string().optional(),
    trace_file: z.string().optional(),
    config_file: z.string().optional(),
    pinzit_version: z.string().optional(),
  })
  .strict();

const summarySchema = z.object({
  overall_verdict: verdictEnum,
  parsed_span_count: z.number(),
  failed_constraint_count: z.number(),
  critical_path_ms: z.number(),
  max_propagation_hops_seen: z.number(),
}).strict().optional();

const timelineEventSchema = z.object({
  timestamp_ns: z.number(),
  span_id: z.string(),
  parent_span_id: z.string().nullable().optional(),
  name: z.string(),
  event_type: z.string(),
  severity: z.string(),
  constraint_refs: z.array(z.string()),
}).strict();

const graphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.string(),
  verdict: z.string(),
  duration_ms: z.number(),
}).strict();

const graphEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  kind: z.string(),
  latency_ms: z.number(),
}).strict();

const graphSchema = z.object({
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
}).strict().optional();

export const verdictSchema = z.object({
  overall_verdict: verdictEnum,
  metadata: metadataSchema.optional(),
  summary: summarySchema.optional(),
  constraints: z.object({
    slfs_001: constraintResultBaseSchema.extend({ metrics: slfsMetricsSchema }).strict(),
    rtcb_002: constraintResultBaseSchema.extend({ metrics: rtcbMetricsSchema }).strict(),
    brc_003: constraintResultBaseSchema.extend({ metrics: brcMetricsSchema }).strict(),
  }),
  timeline: z.array(timelineEventSchema).optional(),
  graph: graphSchema.optional(),
});

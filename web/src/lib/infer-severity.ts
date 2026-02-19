import type { FindingRow, Verdict } from '../types/pinzit';

const severityMap = {
  FAIL: 'Critical',
  SKIPPED: 'Medium',
  PASS: 'Low',
} as const;

export function inferSeverity(verdict: Verdict): FindingRow[] {
  return (Object.entries(verdict.constraints) as [FindingRow['id'], Verdict['constraints'][keyof Verdict['constraints']]][])
    .map(([id, result]) => {
      const metrics = result.metrics as Record<string, unknown>;
      const metricEntry = Object.entries(metrics)[0];
      return {
        id,
        verdict: result.verdict,
        severity: severityMap[result.verdict] ?? 'High',
        confidence: result.verdict === 'FAIL' ? 0.91 : result.verdict === 'SKIPPED' ? 0.7 : 0.97,
        evidenceCount: result.evidence_spans.length,
        keyMetric: metricEntry ? `${metricEntry[0]}=${String(metricEntry[1])}` : 'n/a',
      };
    })
    .sort((a, b) => {
      const rank = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return rank[a.severity] - rank[b.severity];
    });
}

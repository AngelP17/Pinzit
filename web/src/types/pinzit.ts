import { z } from 'zod';
import { verdictSchema } from '../schemas/verdict';

export type Verdict = z.infer<typeof verdictSchema>;
export type ConstraintId = keyof Verdict['constraints'];
export type ConstraintResult = Verdict['constraints'][ConstraintId];
export type VerdictState = Verdict['overall_verdict'];

export type CsvMetricRow = {
  metric: string;
  value: string;
};

export type RunBundle = {
  verdict: Verdict;
  csvRows: CsvMetricRow[];
  loadedAt: string;
  fileNames: {
    verdict: string;
    csv: string;
  };
};

export type FindingRow = {
  id: ConstraintId;
  verdict: VerdictState;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number;
  evidenceCount: number;
  keyMetric: string;
};

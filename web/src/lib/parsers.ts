import Papa from 'papaparse';
import { ZodError } from 'zod';
import { verdictSchema } from '../schemas/verdict';
import type { CsvMetricRow, Verdict } from '../types/pinzit';

function issuePath(error: ZodError): string {
  const first = error.issues[0];
  if (!first) return 'unknown';
  return first.path.length > 0 ? first.path.join('.') : 'root';
}

export function parseVerdict(raw: string, fileName = 'verdict.json'): Verdict {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${fileName}: invalid JSON syntax`);
  }

  const validated = verdictSchema.safeParse(parsed);
  if (!validated.success) {
    const path = issuePath(validated.error);
    throw new Error(`${fileName}: incompatible verdict schema at "${path}"`);
  }

  const constraints = validated.data.constraints;
  if (!constraints.slfs_001) {
    throw new Error(`${fileName}: missing "constraints.slfs_001"`);
  }
  if (!constraints.rtcb_002) {
    throw new Error(`${fileName}: missing "constraints.rtcb_002"`);
  }
  if (!constraints.brc_003) {
    throw new Error(`${fileName}: missing "constraints.brc_003"`);
  }

  return validated.data;
}

export function parseCsv(raw: string, fileName = 'stats.csv'): CsvMetricRow[] {
  const [headerLine] = raw.split(/\r?\n/);
  if ((headerLine ?? '').trim() !== 'metric,value') {
    throw new Error(`${fileName}: expected CSV header "metric,value"`);
  }

  const parsed = Papa.parse<CsvMetricRow>(raw, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(`${fileName}: ${parsed.errors[0]?.message ?? 'failed to parse CSV'}`);
  }

  const rows = parsed.data.filter((row) => row.metric && row.value);
  if (rows.length === 0) {
    throw new Error(`${fileName}: no metric rows found`);
  }

  const requiredMetrics = ['resource_span_markers', 'parsed_span_count', 'overall_verdict'];
  for (const metric of requiredMetrics) {
    if (!rows.some((row) => row.metric === metric)) {
      throw new Error(`${fileName}: missing required metric "${metric}"`);
    }
  }

  return rows;
}

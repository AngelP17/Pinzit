import passVerdictRaw from '../assets/sample/pass-verdict.json';
import failVerdictRaw from '../assets/sample/fail-verdict.json';
import passStatsRaw from '../assets/sample/pass-stats.csv?raw';
import failStatsRaw from '../assets/sample/fail-stats.csv?raw';
import { parseCsv, parseVerdict } from './parsers';
import type { RunBundle } from '../types/pinzit';

export function loadSamplePass(): RunBundle {
  return {
    verdict: parseVerdict(JSON.stringify(passVerdictRaw), 'pass-verdict.json'),
    csvRows: parseCsv(passStatsRaw, 'pass-stats.csv'),
    loadedAt: new Date().toISOString(),
    fileNames: { verdict: 'pass-verdict.json', csv: 'pass-stats.csv' },
  };
}

export function loadSampleFail(): RunBundle {
  return {
    verdict: parseVerdict(JSON.stringify(failVerdictRaw), 'fail-verdict.json'),
    csvRows: parseCsv(failStatsRaw, 'fail-stats.csv'),
    loadedAt: new Date().toISOString(),
    fileNames: { verdict: 'fail-verdict.json', csv: 'fail-stats.csv' },
  };
}

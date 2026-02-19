import type { RunBundle } from '../types/pinzit';
import { createMockBundle } from './demo-mock';

export function loadSamplePass(): RunBundle {
  return createMockBundle('pass');
}

export function loadSampleFail(): RunBundle {
  return createMockBundle('fail');
}

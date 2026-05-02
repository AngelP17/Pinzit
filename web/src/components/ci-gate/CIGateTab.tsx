import type { RunBundle } from '../../types/pinzit';
import { CIGatePanel } from './CIGatePanel';

export function CIGateTab({ run }: { run: RunBundle | null }) {
  return <CIGatePanel run={run} />;
}

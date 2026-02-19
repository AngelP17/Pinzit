import type { RunBundle } from '../../types/pinzit';
import { DiffBanner } from './DiffBanner';
import { DiffTable } from './DiffTable';

export function DiffMode({ base, next }: { base: RunBundle | null; next: RunBundle | null }) {
  if (!base || !next) return null;
  return (
    <div className="mb-4 space-y-4">
      <DiffBanner base={base} next={next} />
      <DiffTable base={base} next={next} />
    </div>
  );
}

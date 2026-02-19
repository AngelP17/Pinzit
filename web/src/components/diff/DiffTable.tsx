import type { RunBundle } from '../../types/pinzit';

export function DiffTable({ base, next }: { base: RunBundle; next: RunBundle }) {
  const ids = Object.keys(base.verdict.constraints) as (keyof typeof base.verdict.constraints)[];

  return (
    <div className="panel overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-700">
          <tr>
            <th className="px-3 py-2">Constraint</th>
            <th className="px-3 py-2">Before</th>
            <th className="px-3 py-2">After</th>
            <th className="px-3 py-2">Change</th>
          </tr>
        </thead>
        <tbody>
          {ids.map((id) => {
            const before = base.verdict.constraints[id].verdict;
            const after = next.verdict.constraints[id].verdict;
            return (
              <tr key={id} className="border-t border-surface-600">
                <td className="px-3 py-2">{id}</td>
                <td className="px-3 py-2">{before}</td>
                <td className="px-3 py-2">{after}</td>
                <td className="px-3 py-2">{before === after ? '→' : before === 'PASS' && after === 'FAIL' ? '↓ Regression' : '↑ Improvement'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
